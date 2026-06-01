import { Inject, Injectable } from '@nestjs/common';

import { IncidentStatus } from '../../../shared/enums/incident.enums';
import { Incident } from '../../domain/entities/incident.entity';
import {
  INCIDENT_REPOSITORY,
  IncidentRepository,
} from '../../domain/repositories/incident.repository';

@Injectable()
export class IncidentService {
  constructor(
    @Inject(INCIDENT_REPOSITORY)
    private readonly incidentRepository: IncidentRepository,
  ) {}

  public async findAll() {
    return this.incidentRepository.findAll();
  }

  public async findByFilters(filter: {
    statuses?: IncidentStatus[];
    severities?: any[];
  }) {
    return this.incidentRepository.findByFilters(filter as any);
  }

  public async findOne(id: string) {
    return this.incidentRepository.findById(id);
  }

  public async resolve(
    id: string,
    userId: string,
    status: IncidentStatus,
  ): Promise<Incident> {
    const incident = await this.incidentRepository.findById(id);
    if (!incident) {
      throw new Error('Incident not found');
    }

    incident.transitionStatus(status, userId);
    await this.incidentRepository.save(incident);

    return incident;
  }

  public async delete(id: string) {
    await this.incidentRepository.delete(id);
  }
}
