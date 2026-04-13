import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { SharedModule } from '../shared/shared.module';
import { DonationService } from './application/services/donation.service';
import { DonationCampaignService } from './application/services/donation-campaign.service';
import { DonationTransactionService } from './application/services/donation-transaction.service';
import { DONATION_REPOSITORY } from './domain/repositories/donation.repository';
import { DONATION_CAMPAIGN_REPOSITORY } from './domain/repositories/donation-campaign.repository';
import { DonationCampaignTypeOrmRepository } from './infrastructure/persistence/repositories/donation-campaign-typeorm.repository';
import { DonationTypeOrmRepository } from './infrastructure/persistence/repositories/donation-typeorm.repository';
import { DonationCampaignTypeOrmEntity } from './infrastructure/persistence/typeorm/donation-campaign-typeorm.entity';
import { DonationTypeOrmEntity } from './infrastructure/persistence/typeorm/donation-typeorm.entity';
import { ChapaClient } from './infrastructure/services/chapa.client';
import { DonationController } from './interfaces/http/controllers/donation.controller';

@Module({
  imports: [
    SharedModule,
    TypeOrmModule.forFeature([
      DonationTypeOrmEntity,
      DonationCampaignTypeOrmEntity,
    ]),
  ],
  controllers: [DonationController],
  providers: [
    ChapaClient,
    DonationCampaignService,
    DonationTransactionService,
    DonationService,
    {
      provide: DONATION_REPOSITORY,
      useClass: DonationTypeOrmRepository,
    },
    {
      provide: DONATION_CAMPAIGN_REPOSITORY,
      useClass: DonationCampaignTypeOrmRepository,
    },
  ],
  exports: [DONATION_REPOSITORY, DONATION_CAMPAIGN_REPOSITORY],
})
export class DonationModule {}
