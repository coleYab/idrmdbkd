import { Inject, Injectable } from '@nestjs/common';

import { Location } from '../../domain/entities/location.entity';
import {
  LOCATION_REPOSITORY,
  LocationRepository,
} from '../../domain/repositories/location.repository';

@Injectable()
export class LocationService {
  constructor(
    @Inject(LOCATION_REPOSITORY)
    private readonly locationRepository: LocationRepository,
  ) {}

  public async findAll(): Promise<Location[]> {
    return this.locationRepository.findAll();
  }

  public async findOne(id: string): Promise<Location | null> {
    return this.locationRepository.findById(id);
  }

  public async delete(id: string): Promise<void> {
    await this.locationRepository.delete(id);
  }
}
