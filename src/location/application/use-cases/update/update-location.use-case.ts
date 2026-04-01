import { Inject, Injectable } from '@nestjs/common';

import { Location } from '../../../domain/entities/location.entity';
import {
  LOCATION_REPOSITORY,
  LocationRepository,
} from '../../../domain/repositories/location.repository';
import { UpdateLocationDto } from '../../dto/update-location.dto';

@Injectable()
export class UpdateLocationUseCase {
  constructor(
    @Inject(LOCATION_REPOSITORY)
    private readonly locationRepository: LocationRepository,
  ) {}

  async execute(id: string, dto: UpdateLocationDto): Promise<Location> {
    const location = await this.locationRepository.findById(id);
    if (!location) {
      throw new Error('Location not found');
    }

    location.update(dto.name, dto.description);

    await this.locationRepository.update(location);

    return location;
  }
}
