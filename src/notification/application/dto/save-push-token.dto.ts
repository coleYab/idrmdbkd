import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

export class SavePushTokenDto {
  @ApiPropertyOptional({
    example: 'user_2p5x9K4m1Sg0mQ',
    description: 'Clerk user id or email. Used as the lookup key.',
  })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  clerkUserId?: string;

  @ApiPropertyOptional({ example: 'user@example.com' })
  @IsOptional()
  @IsEmail()
  @MaxLength(255)
  email?: string;

  @ApiProperty({ example: 'ExponentPushToken[xxxxxxxxxxxxxxxxxxxxxx]' })
  @IsNotEmpty()
  @IsString()
  @MaxLength(255)
  pushToken: string;
}
