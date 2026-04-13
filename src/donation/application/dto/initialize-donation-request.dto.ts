import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Min,
  ValidateNested,
} from 'class-validator';

import { DonorInfoDto } from './donor-info.dto';

export class InitializeDonationRequest {
  @ApiProperty({ example: 'c84ed5b4-20f4-45d2-a8b1-2b739d5af4df' })
  @IsUUID()
  campaignID: string;

  @ApiProperty({ example: 1000, minimum: 0.01 })
  @IsNumber()
  @Min(0.01)
  amount: number;

  @ApiProperty({ example: 'ETB' })
  @IsString()
  @IsNotEmpty()
  currency: string;

  @ApiProperty({ type: DonorInfoDto })
  @ValidateNested()
  @Type(() => DonorInfoDto)
  donor: DonorInfoDto;

  @ApiPropertyOptional({
    description: 'Idempotency key. Prefer sending as Idempotency-Key header.',
  })
  @IsOptional()
  @IsString()
  idempotencyKey?: string;
}
