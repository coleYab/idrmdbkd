import { IsEnum, IsNotEmpty, IsString, MaxLength } from 'class-validator';

import { NotificationStatus } from '../../domain/entities/notification.entity';

export class UpdateNotificationDto {
  @IsNotEmpty()
  @IsString()
  @MaxLength(100)
  title: string;

  @IsNotEmpty()
  @IsString()
  @MaxLength(500)
  message: string;

  @IsNotEmpty()
  @IsEnum(NotificationStatus)
  status: NotificationStatus;
}
