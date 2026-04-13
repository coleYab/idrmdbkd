import { BadRequestException, NotFoundException } from '@nestjs/common';

import { DonationCampaign } from '../../domain/entities/donation-campaign.entity';
import { CampaignStatus } from '../../domain/enums/campaign-status.enum';
import { DonationCampaignRepository } from '../../domain/repositories/donation-campaign.repository';
import { CreateCampaignRequest } from '../dto/create-campaign-request.dto';
import { UpdateCampaignStatusRequest } from '../dto/update-campaign-status-request.dto';
import { DonationCampaignService } from './donation-campaign.service';

describe('DonationCampaignService', () => {
  const campaignRepository: jest.Mocked<DonationCampaignRepository> = {
    findById: jest.fn(),
    findAll: jest.fn(),
    save: jest.fn(),
    update: jest.fn(),
  };

  let service: DonationCampaignService;

  beforeEach(() => {
    jest.resetAllMocks();
    service = new DonationCampaignService(campaignRepository);
  });

  describe('createCampaign', () => {
    it('creates and persists a campaign with default currency', async () => {
      const dto: CreateCampaignRequest = {
        disasterID: 'dis-1' as any,
        goalAmount: 100,
        description: 'desc',
      };

      const campaign = await service.createCampaign(dto);

      expect(campaign.getCurrency()).toBe('ETB');
      expect(campaignRepository.save).toHaveBeenCalledTimes(1);
    });
  });

  describe('findCampaignById', () => {
    it('throws NotFound when campaign does not exist', async () => {
      campaignRepository.findById.mockResolvedValue(null);

      await expect(service.findCampaignById('missing')).rejects.toBeInstanceOf(
        NotFoundException,
      );
    });
  });

  describe('changeCampaignStatus', () => {
    it('activates a campaign and persists', async () => {
      const campaign = DonationCampaign.create(
        'camp-1',
        'dis-1',
        100,
        'ETB',
        'desc',
      );

      campaignRepository.findById.mockResolvedValue(campaign);

      const dto: UpdateCampaignStatusRequest = {
        status: CampaignStatus.ACTIVE,
      };

      const updated = await service.changeCampaignStatus('camp-1', dto);

      expect(updated.getStatus()).toBe(CampaignStatus.ACTIVE);
      expect(campaignRepository.update).toHaveBeenCalledWith(campaign);
    });

    it('wraps domain errors as BadRequest', async () => {
      const campaign = DonationCampaign.create(
        'camp-1',
        'dis-1',
        100,
        'ETB',
        'desc',
      );

      campaignRepository.findById.mockResolvedValue(campaign);

      const dto: UpdateCampaignStatusRequest = {
        status: CampaignStatus.PAUSED,
      };

      await expect(service.changeCampaignStatus('camp-1', dto)).rejects.toBeInstanceOf(
        BadRequestException,
      );
    });

    it('rejects transition back to DRAFT', async () => {
      const campaign = DonationCampaign.create(
        'camp-1',
        'dis-1',
        100,
        'ETB',
        'desc',
      );

      campaignRepository.findById.mockResolvedValue(campaign);

      const dto: UpdateCampaignStatusRequest = {
        status: CampaignStatus.DRAFT,
      };

      await expect(service.changeCampaignStatus('camp-1', dto)).rejects.toBeInstanceOf(
        BadRequestException,
      );
    });
  });

  describe('applyCompletedDonation', () => {
    it('applies donation and persists', async () => {
      const campaign = DonationCampaign.create(
        'camp-1',
        'dis-1',
        100,
        'ETB',
        'desc',
      );
      campaign.activate();

      campaignRepository.findById.mockResolvedValue(campaign);

      await service.applyCompletedDonation('camp-1', 10, 'ETB');

      expect(campaign.getCurrentAmount()).toBe(10);
      expect(campaignRepository.update).toHaveBeenCalledWith(campaign);
    });

    it('wraps domain errors as BadRequest', async () => {
      const campaign = DonationCampaign.create(
        'camp-1',
        'dis-1',
        100,
        'ETB',
        'desc',
      );

      campaignRepository.findById.mockResolvedValue(campaign);

      await expect(service.applyCompletedDonation('camp-1', 10, 'ETB')).rejects.toBeInstanceOf(
        BadRequestException,
      );
    });
  });
});
