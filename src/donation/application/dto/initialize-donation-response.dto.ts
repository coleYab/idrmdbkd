import { ApiProperty } from '@nestjs/swagger';

export class InitializeDonationResponse {
  @ApiProperty()
  checkoutUrl: string;

  @ApiProperty()
  donationId: string;

  @ApiProperty()
  tx_ref: string;
}
