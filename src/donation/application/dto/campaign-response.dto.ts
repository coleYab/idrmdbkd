import { ApiProperty } from '@nestjs/swagger';

import { DonationCampaign } from '../../domain/entities/donation-campaign.entity';
import { CampaignStatus } from '../../domain/enums/campaign-status.enum';

export class CampaignResponse {
  @ApiProperty()
  campaignID: string;

  @ApiProperty()
  disasterID: string;

  @ApiProperty()
  goalAmount: number;

  @ApiProperty()
  currentAmount: number;

  @ApiProperty()
  currency: string;

  @ApiProperty({ enum: CampaignStatus })
  status: CampaignStatus;

  @ApiProperty()
  donationCount: number;

  @ApiProperty()
  description: string;

  @ApiProperty()
  progressPercentage: number;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;

  @ApiProperty({ required: false })
  closedAt?: Date;

  public static fromDomain(campaign: DonationCampaign): CampaignResponse {
    return {
      campaignID: campaign.getCampaignID(),
      disasterID: campaign.getDisasterID(),
      goalAmount: campaign.getGoalAmount(),
      currentAmount: campaign.getCurrentAmount(),
      currency: campaign.getCurrency(),
      status: campaign.getStatus(),
      donationCount: campaign.getDonationCount(),
      description: campaign.getDescription(),
      progressPercentage: campaign.getProgressPercentage(),
      createdAt: campaign.getCreatedAt(),
      updatedAt: campaign.getUpdatedAt(),
      closedAt: campaign.getClosedAt(),
    };
  }
}
