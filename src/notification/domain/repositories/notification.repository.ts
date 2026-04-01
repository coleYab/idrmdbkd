import { Notification } from '../entities/notification.entity';

export const NOTIFICATION_REPOSITORY = Symbol.for('NotificationRepository');
export interface NotificationRepository {
  findById(id: string): Promise<Notification | null>;
  findAll(): Promise<Notification[]>;
  findByRecipient(recipient: string): Promise<Notification[]>;
  save(notification: Notification): Promise<void>;
  update(notification: Notification): Promise<void>;
  delete(id: string): Promise<void>;
}
