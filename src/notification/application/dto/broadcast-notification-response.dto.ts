import { ApiProperty } from '@nestjs/swagger';

export class BroadcastNotificationResponseDto {
  @ApiProperty()
  totalUsers: number;

  @ApiProperty()
  pushSentCount: number;

  @ApiProperty()
  pushFailedCount: number;

  @ApiProperty()
  emailSentCount: number;

  @ApiProperty()
  emailFailedCount: number;
}
