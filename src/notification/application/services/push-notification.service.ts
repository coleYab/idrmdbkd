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

    // Prefer finding by pushToken to avoid duplicates for the same device
    const byToken = await this.notificationPushTokenRepository.findByPushToken(
      dto.pushToken,
    );
    if (byToken) {
      byToken.key = key;
      byToken.email = dto.email || null;
      return this.notificationPushTokenRepository.save(byToken);
    }

    // If a record exists for this user key, update its token instead of creating a duplicate
    const byKey = await this.notificationPushTokenRepository.findByKey(key);
    if (byKey) {
      byKey.pushToken = dto.pushToken;
      byKey.email = dto.email || null;
      return this.notificationPushTokenRepository.save(byKey);
    }

    // Otherwise, create a new record for this token and key
    const token = new NotificationPushToken();
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
      .filter(
        (token): token is string =>
          Boolean(token) && Expo.isExpoPushToken(token),
      )
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
