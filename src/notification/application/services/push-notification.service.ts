import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { Expo, ExpoPushMessage } from 'expo-server-sdk';

import { NotificationPushToken } from '../../domain/entities/notification-push-token.entity';
import { NOTIFICATION_PUSH_TOKEN_REPOSITORY } from '../../domain/repositories/notification-push-token.repository';
import { NotificationPushTokenRepository } from '../../domain/repositories/notification-push-token.repository';
import { BroadcastNotificationResponseDto } from '../dto/broadcast-notification-response.dto';
import { SavePushTokenDto } from '../dto/save-push-token.dto';

@Injectable()
export class PushNotificationService {
  private readonly expo = new Expo();

  constructor(
    @Inject(NOTIFICATION_PUSH_TOKEN_REPOSITORY)
    private readonly notificationPushTokenRepository: NotificationPushTokenRepository,
  ) {}

  async savePushToken(dto: SavePushTokenDto): Promise<NotificationPushToken> {
    const key = dto.clerkUserId || dto.email;
    if (!key) {
      throw new BadRequestException('Provide either clerkUserId or email');
    }

    const existing = await this.notificationPushTokenRepository.findByKey(key);
    const token = existing ?? new NotificationPushToken();

    token.key = key;
    token.email = dto.email || null;
    token.pushToken = dto.pushToken;

    return this.notificationPushTokenRepository.save(token);
  }

  async broadcast(
    title: string,
    message: string,
  ): Promise<BroadcastNotificationResponseDto> {
    const tokens = await this.notificationPushTokenRepository.findAll();

    const messages = tokens
      .map((token: NotificationPushToken) => token.pushToken)
      .filter((token): token is string => Boolean(token) && Expo.isExpoPushToken(token))
      .map<ExpoPushMessage>((token) => ({
        to: token,
        sound: 'default',
        title,
        body: message,
        data: { title, message },
      }));

    let sentCount = 0;
    let failedCount = 0;

    for (const chunk of this.expo.chunkPushNotifications(messages)) {
      try {
        const tickets = await this.expo.sendPushNotificationsAsync(chunk);
        for (const ticket of tickets) {
          if (ticket.status === 'ok') {
            sentCount += 1;
          } else {
            failedCount += 1;
          }
        }
      } catch {
        failedCount += chunk.length;
      }
    }

    return {
      totalUsers: messages.length,
      sentCount,
      failedCount,
    };
  }
}
