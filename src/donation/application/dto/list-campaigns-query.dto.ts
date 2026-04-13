import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsEnum, IsInt, IsOptional, IsUUID, Max, Min } from 'class-validator';

import { CampaignStatus } from '../../domain/enums/campaign-status.enum';

export class ListCampaignsQueryDto {
  @ApiPropertyOptional({ enum: CampaignStatus, example: CampaignStatus.ACTIVE })
  @IsOptional()
  @IsEnum(CampaignStatus)
  status?: CampaignStatus;

  @ApiPropertyOptional({
    description: 'Filter by disaster ID',
    example: 'c84ed5b4-20f4-45d2-a8b1-2b739d5af4df',
  })
  @IsOptional()
  @IsUUID()
  disasterId?: string;

  @ApiPropertyOptional({ default: 1, minimum: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number;

  @ApiPropertyOptional({ default: 20, minimum: 1, maximum: 100 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number;
}
