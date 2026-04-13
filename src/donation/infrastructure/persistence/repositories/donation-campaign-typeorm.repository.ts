import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { DonationCampaign } from '../../../domain/entities/donation-campaign.entity';
import {
  CampaignFilter,
  DonationCampaignRepository,
} from '../../../domain/repositories/donation-campaign.repository';
import { DonationCampaignTypeOrmEntity } from '../typeorm/donation-campaign-typeorm.entity';

@Injectable()
export class DonationCampaignTypeOrmRepository implements DonationCampaignRepository {
  constructor(
    @InjectRepository(DonationCampaignTypeOrmEntity)
    private readonly repository: Repository<DonationCampaignTypeOrmEntity>,
  ) {}

  public async findById(campaignId: string): Promise<DonationCampaign | null> {
    const entity = await this.repository.findOne({
      where: { campaignID: campaignId },
    });

    return entity ? this.toDomain(entity) : null;
  }

  public async findAll(
    filter: CampaignFilter,
  ): Promise<[DonationCampaign[], number]> {
    const qb = this.repository.createQueryBuilder('campaign');

    if (filter.status) {
      qb.andWhere('campaign.status = :status', { status: filter.status });
    }

    if (filter.disasterId) {
      qb.andWhere('campaign.disasterID = :disasterId', {
        disasterId: filter.disasterId,
      });
    }

    qb.orderBy('campaign.createdAt', 'DESC');
    qb.skip((filter.page - 1) * filter.limit).take(filter.limit);

    const [entities, total] = await qb.getManyAndCount();
    return [entities.map((entity) => this.toDomain(entity)), total];
  }

  public async save(campaign: DonationCampaign): Promise<void> {
    await this.repository.save(this.toPersistence(campaign));
  }

  public async update(campaign: DonationCampaign): Promise<void> {
    await this.repository.save(this.toPersistence(campaign));
  }

  private toPersistence(
    campaign: DonationCampaign,
  ): DonationCampaignTypeOrmEntity {
    const entity = new DonationCampaignTypeOrmEntity();
    entity.campaignID = campaign.getCampaignID();
    entity.disasterID = campaign.getDisasterID();
    entity.goalAmount = campaign.getGoalAmount().toFixed(2);
    entity.currentAmount = campaign.getCurrentAmount().toFixed(2);
    entity.currency = campaign.getCurrency();
    entity.status = campaign.getStatus();
    entity.donationCount = campaign.getDonationCount();
    entity.description = campaign.getDescription();
    entity.createdAt = campaign.getCreatedAt();
    entity.updatedAt = campaign.getUpdatedAt();
    entity.closedAt = campaign.getClosedAt();
    return entity;
  }

  private toDomain(entity: DonationCampaignTypeOrmEntity): DonationCampaign {
    return new DonationCampaign(
      entity.campaignID,
      entity.disasterID,
      Number(entity.goalAmount),
      Number(entity.currentAmount),
      entity.currency,
      entity.status,
      entity.donationCount,
      entity.description,
      entity.createdAt,
      entity.updatedAt,
      entity.closedAt,
    );
  }
}
