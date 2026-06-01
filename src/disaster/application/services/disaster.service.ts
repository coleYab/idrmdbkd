import { Inject, Injectable } from '@nestjs/common';

import { DisasterStatus } from '../../../shared/enums/disaster.enums';
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

  public async findByFilters(filter: {
    statuses?: any[];
    severities?: any[];
  }): Promise<Disaster[]> {
    return this.incidentRepository.findByFilters(filter as any);
  }

  public async findOne(id: string): Promise<Disaster | null> {
    return this.incidentRepository.findById(id);
  }

  public async resolve(
    id: string,
    userId: string,
    status: DisasterStatus,
  ): Promise<Disaster> {
    const disaster = await this.incidentRepository.findById(id);
    if (!disaster) {
      throw new Error('Disaster not found');
    }

    disaster.transitionStatus(status, userId);
    await this.incidentRepository.save(disaster);

    return disaster;
  }

  public async delete(id: string): Promise<void> {
    await this.incidentRepository.delete(id);
  }
}
