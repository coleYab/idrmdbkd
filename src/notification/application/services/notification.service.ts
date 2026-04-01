import { Inject, Injectable } from '@nestjs/common';

import { Notification } from '../../domain/entities/notification.entity';
import {
  NOTIFICATION_REPOSITORY,
  NotificationRepository,
} from '../../domain/repositories/notification.repository';

@Injectable()
export class NotificationService {
  constructor(
    @Inject(NOTIFICATION_REPOSITORY)
    private readonly notificationRepository: NotificationRepository,
  ) {}

  public async findAll(): Promise<Notification[]> {
    return this.notificationRepository.findAll();
  }

  public async findOne(id: string): Promise<Notification | null> {
    return this.notificationRepository.findById(id);
  }

  public async findByRecipient(recipient: string): Promise<Notification[]> {
    return this.notificationRepository.findByRecipient(recipient);
  }

  public async delete(id: string): Promise<void> {
    await this.notificationRepository.delete(id);
  }
}
