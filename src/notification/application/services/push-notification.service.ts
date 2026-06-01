import { BadRequestException, Inject, Injectable, Logger } from '@nestjs/common';
import { Expo, ExpoPushMessage, ExpoPushTicket } from 'expo-server-sdk';

import { NotificationPushToken } from '../../domain/entities/notification-push-token.entity';
import { NOTIFICATION_PUSH_TOKEN_REPOSITORY } from '../../domain/repositories/notification-push-token.repository';
import { NotificationPushTokenRepository } from '../../domain/repositories/notification-push-token.repository';
import { BroadcastNotificationResponseDto } from '../dto/broadcast-notification-response.dto';
import { SavePushTokenDto } from '../dto/save-push-token.dto';
import { EmailService } from './email.service';

@Injectable()
export class PushNotificationService {
  private readonly expo = new Expo();
  private readonly logger = new Logger(PushNotificationService.name);

  constructor(
    @Inject(NOTIFICATION_PUSH_TOKEN_REPOSITORY)
    private readonly notificationPushTokenRepository: NotificationPushTokenRepository,
    private readonly emailService: EmailService,
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
    this.logger.log(`Broadcast: ${tokens.length} tokens in DB`);

    const validTokens = tokens
      .map((token: NotificationPushToken) => token.pushToken)
      .filter(
        (token): token is string =>
          Boolean(token) && Expo.isExpoPushToken(token),
      );
    this.logger.log(`Broadcast: ${validTokens.length} valid Expo tokens after filtering`);

    const messages = validTokens.map<ExpoPushMessage>((token) => ({
      to: token,
      sound: 'default',
      title,
      body: message,
      data: { title, message },
    }));

    let pushSentCount = 0;
    let pushFailedCount = 0;
    let removedCount = 0;

    for (const chunk of this.expo.chunkPushNotifications(messages)) {
      try {
        const tickets = await this.expo.sendPushNotificationsAsync(chunk);

        for (let i = 0; i < tickets.length; i++) {
          const ticket = tickets[i];

          if (ticket.status === 'ok') {
            pushSentCount += 1;
            continue;
          }

          pushFailedCount += 1;

          const failedToken = chunk[i]?.to;
          if (typeof failedToken !== 'string') continue;
          const errorCode = (ticket as ExpoPushTicket & { details?: { error?: string } }).details?.error;

          if (errorCode && ['InvalidToken', 'DeviceNotRegistered'].includes(errorCode)) {
            this.logger.warn(`Broadcast: removing ${errorCode} token from DB`);
            await this.notificationPushTokenRepository.deleteByPushToken(failedToken);
            removedCount += 1;
          }
        }
      } catch (error) {
        this.logger.error(`Broadcast: chunk send failed - ${error}`);
        pushFailedCount += chunk.length;
      }
    }

    this.logger.log(`Broadcast: push sent=${pushSentCount} failed=${pushFailedCount} removed=${removedCount}`);

    const emailResult = await this.emailService.sendBroadcastEmail(title, message);

    return {
      totalUsers: messages.length,
      pushSentCount,
      pushFailedCount,
      emailSentCount: emailResult.sent,
      emailFailedCount: emailResult.failed,
    };
  }
}
