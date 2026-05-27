import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class CreateNotificationBroadcastDto {
  @ApiProperty({ example: 'Emergency alert' })
  @IsNotEmpty()
  @IsString()
  @MaxLength(100)
  title: string;

  @ApiProperty({ example: 'Please stay indoors until further notice.' })
  @IsNotEmpty()
  @IsString()
  @MaxLength(1000)
  message: string;
}
