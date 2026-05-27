import { Inject, Injectable } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';

import {
  Notification,
  NotificationType,
  NotificationStatus,
} from '../../../domain/entities/notification.entity';
import {
  NOTIFICATION_REPOSITORY,
  NotificationRepository,
} from '../../../domain/repositories/notification.repository';
import { CreateNotificationBroadcastDto } from '../../dto/create-notification-broadcast.dto';
import { User } from '../../../../user/entities/user.entity';
import { UserRepository } from '../../../../user/repositories/user.repository';

@Injectable()
export class CreateNotificationCampaignUseCase {
  constructor(
    @Inject(NOTIFICATION_REPOSITORY)
    private readonly notificationRepository: NotificationRepository,
    private readonly userRepository: UserRepository,
  ) {}

  async execute(dto: CreateNotificationBroadcastDto): Promise<Notification[]> {
    const users = await this.userRepository.find({
      where: { isAccountDisabled: false },
    });

    const notifications = users.map((user: User) =>
      Notification.create(
        uuidv4(),
        dto.title,
        dto.message,
        user.id.toString(),
        NotificationType.IN_APP,
        NotificationStatus.PENDING,
        new Date(),
        new Date(),
      ),
    );

    await this.notificationRepository.saveMany(notifications);
    return notifications;
  }
}
