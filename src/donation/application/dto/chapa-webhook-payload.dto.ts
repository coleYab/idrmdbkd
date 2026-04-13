import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class ChapaWebhookPayload {
  @ApiProperty({ example: 'charge.success' })
  @IsString()
  @IsNotEmpty()
  event: string;

  @ApiProperty({ example: 'DON-ef5e7d8a-f39f-4c49-b8a5-2a3a84957db0' })
  @IsString()
  @IsNotEmpty()
  tx_ref: string;

  @ApiProperty({ example: '3f7eb8fe7f6c4f4f8fbd' })
  @IsString()
  @IsNotEmpty()
  reference: string;

  @ApiProperty({ example: 'success' })
  @IsString()
  @IsNotEmpty()
  status: string;
}
