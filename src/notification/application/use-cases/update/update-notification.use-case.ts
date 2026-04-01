import { Inject, Injectable } from '@nestjs/common';

import { Notification } from '../../../domain/entities/notification.entity';
import {
  NOTIFICATION_REPOSITORY,
  NotificationRepository,
} from '../../../domain/repositories/notification.repository';
import { UpdateNotificationDto } from '../../dto/update-notification.dto';

@Injectable()
export class UpdateNotificationUseCase {
  constructor(
    @Inject(NOTIFICATION_REPOSITORY)
    private readonly notificationRepository: NotificationRepository,
  ) {}

  async execute(id: string, dto: UpdateNotificationDto): Promise<Notification> {
    const notification = await this.notificationRepository.findById(id);
    if (!notification) {
      throw new Error('Notification not found');
    }

    notification.update(dto.title, dto.message, dto.status);

    await this.notificationRepository.update(notification);

    return notification;
  }
}
