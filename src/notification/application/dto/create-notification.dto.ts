import { IsEnum, IsNotEmpty, IsString, MaxLength } from 'class-validator';

import { NotificationType } from '../../domain/entities/notification.entity';

export class CreateNotificationDto {
  @IsNotEmpty()
  @IsString()
  @MaxLength(100)
  title: string;

  @IsNotEmpty()
  @IsString()
  @MaxLength(1000)
  message: string;

  @IsNotEmpty()
  @IsString()
  @MaxLength(200)
  recipient: string;

  @IsNotEmpty()
  @IsEnum(NotificationType)
  type: NotificationType;
}
