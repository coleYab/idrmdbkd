import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AuditLogModule } from '../audit-log/audit-log.module';
import { SharedModule } from '../shared/shared.module';
import { NotificationService } from './application/services/notification.service';
import { PushNotificationService } from './application/services/push-notification.service';
import { CreateNotificationUseCase } from './application/use-cases/create/create-notification.use-case';
import { UpdateNotificationUseCase } from './application/use-cases/update/update-notification.use-case';
import { NotificationPushToken } from './domain/entities/notification-push-token.entity';
import { NOTIFICATION_REPOSITORY } from './domain/repositories/notification.repository';
import { NOTIFICATION_PUSH_TOKEN_REPOSITORY } from './domain/repositories/notification-push-token.repository';
import { NotificationPushTokenTypeOrmRepository } from './infrastructure/persistence/repositories/notification-push-token-typeorm.repository';
import { NotificationTypeOrmRepository } from './infrastructure/persistence/repositories/notification-typeorm.repository';
import { NotificationTypeOrmEntity } from './infrastructure/persistence/typeorm/notification-typeorm.entity';
import { NotificationController } from './interfaces/http/controllers/notification.controller';

@Module({
  imports: [
    SharedModule,
    AuditLogModule,
    TypeOrmModule.forFeature([
      NotificationTypeOrmEntity,
      NotificationPushToken,
    ]),
  ],
  controllers: [NotificationController],
  providers: [
    CreateNotificationUseCase,
    NotificationService,
    UpdateNotificationUseCase,
    PushNotificationService,
    {
      provide: NOTIFICATION_REPOSITORY,
      useClass: NotificationTypeOrmRepository,
    },
    {
      provide: NOTIFICATION_PUSH_TOKEN_REPOSITORY,
      useClass: NotificationPushTokenTypeOrmRepository,
    },
  ],
  exports: [NOTIFICATION_REPOSITORY],
})
export class NotificationModule {}
