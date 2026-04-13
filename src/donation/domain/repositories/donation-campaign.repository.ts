import { DonationCampaign } from '../entities/donation-campaign.entity';
import { CampaignStatus } from '../enums/campaign-status.enum';

export interface CampaignFilter {
  status?: CampaignStatus;
  disasterId?: string;
  page: number;
  limit: number;
}

export const DONATION_CAMPAIGN_REPOSITORY = Symbol.for(
  'DonationCampaignRepository',
);

export interface DonationCampaignRepository {
  findById(campaignId: string): Promise<DonationCampaign | null>;
  findAll(filter: CampaignFilter): Promise<[DonationCampaign[], number]>;
  save(campaign: DonationCampaign): Promise<void>;
  update(campaign: DonationCampaign): Promise<void>;
}
