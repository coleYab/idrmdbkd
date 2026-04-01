import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { SharedModule } from '../shared/shared.module';
import { NotificationService } from './application/services/notification.service';
import { CreateNotificationUseCase } from './application/use-cases/create/create-notification.use-case';
import { CreateNotificationCampaignUseCase } from './application/use-cases/create/create-notification-campaign.use-case';
import { UpdateNotificationUseCase } from './application/use-cases/update/update-notification.use-case';
import { NOTIFICATION_REPOSITORY } from './domain/repositories/notification.repository';
import { NotificationTypeOrmEntity } from './infrastructure/persistence/typeorm/notification-typeorm.entity';
import { NotificationTypeOrmRepository } from './infrastructure/persistence/repositories/notification-typeorm.repository';
import { NotificationController } from './interfaces/http/controllers/notification.controller';

@Module({
  imports: [
    SharedModule,
    TypeOrmModule.forFeature([NotificationTypeOrmEntity]),
  ],
  controllers: [NotificationController],
  providers: [
    CreateNotificationUseCase,
    CreateNotificationCampaignUseCase,
    NotificationService,
    UpdateNotificationUseCase,
    {
      provide: NOTIFICATION_REPOSITORY,
      useClass: NotificationTypeOrmRepository,
    },
  ],
  exports: [NOTIFICATION_REPOSITORY],
})
export class NotificationModule {}
