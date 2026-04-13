import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';

import { DonationCampaign } from '../../domain/entities/donation-campaign.entity';
import { CampaignStatus } from '../../domain/enums/campaign-status.enum';
import {
  DONATION_CAMPAIGN_REPOSITORY,
  DonationCampaignRepository,
} from '../../domain/repositories/donation-campaign.repository';
import { CreateCampaignRequest } from '../dto/create-campaign-request.dto';
import { ListCampaignsQueryDto } from '../dto/list-campaigns-query.dto';
import { UpdateCampaignStatusRequest } from '../dto/update-campaign-status-request.dto';

@Injectable()
export class DonationCampaignService {
  constructor(
    @Inject(DONATION_CAMPAIGN_REPOSITORY)
    private readonly campaignRepository: DonationCampaignRepository,
  ) {}

  public async createCampaign(
    dto: CreateCampaignRequest,
  ): Promise<DonationCampaign> {
    const campaign = DonationCampaign.create(
      uuidv4(),
      dto.disasterID,
      dto.goalAmount,
      dto.currency ?? 'ETB',
      dto.description,
    );
    await this.campaignRepository.save(campaign);
    return campaign;
  }

  public async findCampaignById(campaignId: string): Promise<DonationCampaign> {
    const campaign = await this.campaignRepository.findById(campaignId);
    if (!campaign) {
      throw new NotFoundException('Campaign not found');
    }

    return campaign;
  }

  public async listCampaigns(
    query: ListCampaignsQueryDto,
  ): Promise<[DonationCampaign[], number, number, number]> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const [data, total] = await this.campaignRepository.findAll({
      status: query.status,
      disasterId: query.disasterId,
      page,
      limit,
    });
    return [data, total, page, limit];
  }

  public async changeCampaignStatus(
    campaignId: string,
    dto: UpdateCampaignStatusRequest,
  ): Promise<DonationCampaign> {
    const campaign = await this.findCampaignById(campaignId);

    try {
      switch (dto.status) {
        case CampaignStatus.ACTIVE:
          campaign.activate();
          break;
        case CampaignStatus.PAUSED:
          campaign.pause();
          break;
        case CampaignStatus.CLOSED:
          campaign.close();
          break;
        case CampaignStatus.DRAFT:
          throw new BadRequestException(
            'Transitioning back to DRAFT is not supported',
          );
      }
    } catch (error) {
      throw new BadRequestException(
        error instanceof Error ? error.message : 'Invalid status transition',
      );
    }

    await this.campaignRepository.update(campaign);
    return campaign;
  }

  public async applyCompletedDonation(
    campaignId: string,
    amount: number,
    currency: string,
  ): Promise<void> {
    const campaign = await this.findCampaignById(campaignId);

    try {
      campaign.addFunds(amount, currency);
      await this.campaignRepository.update(campaign);
    } catch (error) {
      throw new BadRequestException(
        error instanceof Error ? error.message : 'Unable to apply donation',
      );
    }
  }
}
