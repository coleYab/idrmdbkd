import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { SharedModule } from '../shared/shared.module';
import { LocationService } from './application/services/location.service';
import { CreateLocationUseCase } from './application/use-cases/create/create-location.use-case';
import { CreateLocationCampaignUseCase } from './application/use-cases/create/create-location-campaign.use-case';
import { UpdateLocationUseCase } from './application/use-cases/update/update-location.use-case';
import { LOCATION_REPOSITORY } from './domain/repositories/location.repository';
import { LocationTypeOrmRepository } from './infrastructure/persistence/repositories/location-typeorm.repository';
import { LocationTypeOrmEntity } from './infrastructure/persistence/typeorm/location-typeorm.entity';
import { LocationController } from './interfaces/http/controllers/location.controller';

@Module({
  imports: [SharedModule, TypeOrmModule.forFeature([LocationTypeOrmEntity])],
  controllers: [LocationController],
  providers: [
    CreateLocationUseCase,
    CreateLocationCampaignUseCase,
    LocationService,
    UpdateLocationUseCase,
    {
      provide: LOCATION_REPOSITORY,
      useClass: LocationTypeOrmRepository,
    },
  ],
  exports: [LOCATION_REPOSITORY],
})
export class LocationModule {}
