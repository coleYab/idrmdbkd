import { Inject, Injectable } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';

import {
  Notification,
  NotificationStatus,
} from '../../../domain/entities/notification.entity';
import {
  NOTIFICATION_REPOSITORY,
  NotificationRepository,
} from '../../../domain/repositories/notification.repository';
import { CreateNotificationDto } from '../../dto/create-notification.dto';

@Injectable()
export class CreateNotificationUseCase {
  constructor(
    @Inject(NOTIFICATION_REPOSITORY)
    private readonly notificationRepository: NotificationRepository,
  ) {}

  async execute(
    userId: string,
    dto: CreateNotificationDto,
  ): Promise<Notification> {
    const notification = Notification.create(
      uuidv4(),
      dto.title,
      dto.message,
      dto.recipient,
      dto.type,
      NotificationStatus.PENDING,
      new Date(),
      new Date(),
    );

    await this.notificationRepository.save(notification);
    return notification;
  }
}
