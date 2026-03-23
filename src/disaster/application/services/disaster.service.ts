import { Inject, Injectable } from '@nestjs/common';

import { Disaster } from '../../domain/entities/disaster.entity';
import {
  DISASTER_REPOSITORY,
  DisasterRepository,
} from '../../domain/repositories/disaster.repository';

@Injectable()
export class DisasterService {
  constructor(
    @Inject(DISASTER_REPOSITORY)
    private readonly incidentRepository: DisasterRepository,
  ) {}

  public async findAll(): Promise<Disaster[]> {
    return this.incidentRepository.findAll();
  }

  public async findOne(id: string): Promise<Disaster | null> {
    return this.incidentRepository.findById(id);
  }

  public async delete(id: string): Promise<void> {
    await this.incidentRepository.delete(id);
  }
}
