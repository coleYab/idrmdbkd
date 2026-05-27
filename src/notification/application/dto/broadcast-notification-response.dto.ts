import { ApiProperty } from '@nestjs/swagger';

export class BroadcastNotificationResponseDto {
  @ApiProperty()
  totalUsers: number;

  @ApiProperty()
  sentCount: number;

  @ApiProperty()
  failedCount: number;
}
