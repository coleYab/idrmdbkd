import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { SharedModule } from '../shared/shared.module';
import { DonationService } from './application/services/donation.service';
import { CreateDonationUseCase } from './application/use-cases/create/create-donation.use-case';
import { CreateDonationCampagnUseCase } from './application/use-cases/create/create-donation-campaign.use-case';
import { UpdateDonationUseCase } from './application/use-cases/update/update-donation.use-case';
import { DONATION_REPOSITORY } from './domain/repositories/donation.repository';
import { DonationTypeOrmEntity } from './infrastructure/persistence/typeorm/donation-typeorm.entity';
import { DonationController } from './interfaces/http/controllers/donation.controller';

@Module({
  imports: [SharedModule, TypeOrmModule.forFeature([DonationTypeOrmEntity])],
  controllers: [DonationController],
  providers: [
    CreateDonationUseCase,
    CreateDonationCampagnUseCase,
    DonationService,
    UpdateDonationUseCase,
    {
      provide: DONATION_REPOSITORY,
      useClass: DonationTypeOrmEntity,
    },
  ],
  exports: [DONATION_REPOSITORY],
})
export class DonationModule {}
