import { Inject, Injectable } from '@nestjs/common';

import { Location } from '../../../domain/entities/location.entity';
import {
  LOCATION_REPOSITORY,
  LocationRepository,
} from '../../../domain/repositories/location.repository';
import { CreateLocationDto } from '../../dto/create-location.dto';

@Injectable()
export class CreateLocationCampaignUseCase {
  constructor(
    @Inject(LOCATION_REPOSITORY)
    private readonly locationRepository: LocationRepository,
  ) {}

  async execute(userId: string, dto: CreateLocationDto): Promise<Location> {
    const location = Location.create(
      userId,
      dto.name,
      dto.description,
      new Date(),
      new Date(),
    );

    await this.locationRepository.save(location);
    return location;
  }
}
