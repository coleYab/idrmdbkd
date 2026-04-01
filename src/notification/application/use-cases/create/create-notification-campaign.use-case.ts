import { Inject, Injectable } from '@nestjs/common';

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
export class CreateNotificationCampaignUseCase {
  constructor(
    @Inject(NOTIFICATION_REPOSITORY)
    private readonly notificationRepository: NotificationRepository,
  ) {}

  async execute(
    userId: string,
    dto: CreateNotificationDto,
  ): Promise<Notification> {
    const notification = Notification.create(
      userId,
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
