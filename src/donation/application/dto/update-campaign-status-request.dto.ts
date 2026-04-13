import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString } from 'class-validator';

import { CampaignStatus } from '../../domain/enums/campaign-status.enum';

export class UpdateCampaignStatusRequest {
  @ApiProperty({ enum: CampaignStatus, example: CampaignStatus.CLOSED })
  @IsEnum(CampaignStatus)
  status: CampaignStatus;

  @ApiPropertyOptional({
    description: 'Optional reason for transition',
    example: 'Target met',
  })
  @IsOptional()
  @IsString()
  reason?: string;
}
