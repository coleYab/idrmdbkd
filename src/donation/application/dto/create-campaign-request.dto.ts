import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Min,
} from 'class-validator';

export class CreateCampaignRequest {
  @ApiProperty({
    description: 'Disaster ID the campaign belongs to',
    example: 'c84ed5b4-20f4-45d2-a8b1-2b739d5af4df',
  })
  @IsUUID()
  disasterID: string;

  @ApiProperty({
    description: 'Campaign target amount',
    example: 500000,
    minimum: 0.01,
  })
  @IsNumber()
  @Min(0.01)
  goalAmount: number;

  @ApiProperty({
    description: 'Campaign currency',
    example: 'ETB',
    default: 'ETB',
    required: false,
  })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  currency?: string;

  @ApiProperty({
    description: 'Campaign description',
    example: 'Fundraising for emergency shelter and medicine.',
  })
  @IsString()
  @IsNotEmpty()
  description: string;
}
