import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

import { DonationStatus } from '../../domain/enums/donation-status.enum';

export class DonationStatusResponse {
  @ApiProperty()
  donationId: string;

  @ApiProperty({ enum: DonationStatus })
  status: DonationStatus;

  @ApiPropertyOptional()
  failureReason?: string;
}
