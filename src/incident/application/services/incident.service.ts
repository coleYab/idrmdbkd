import { Inject, Injectable } from '@nestjs/common';

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

  public async findOne(id: string) {
    return this.incidentRepository.findById(id);
  }

  public async delete(id: string) {
    await this.incidentRepository.delete(id);
  }
}
