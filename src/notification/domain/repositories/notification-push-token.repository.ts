import { NotificationPushToken } from '../entities/notification-push-token.entity';

export const NOTIFICATION_PUSH_TOKEN_REPOSITORY = Symbol.for(
  'NotificationPushTokenRepository',
);

export interface NotificationPushTokenRepository {
  findAll(): Promise<NotificationPushToken[]>;
  findByKey(key: string): Promise<NotificationPushToken | null>;
  save(token: NotificationPushToken): Promise<NotificationPushToken>;
}