import { Inject, Injectable } from '@nestjs/common';

import { Incident } from '../../../domain/entities/incident.entity';
import {
  INCIDENT_REPOSITORY,
  IncidentRepository,
} from '../../../domain/repositories/incident.repository';
import { UpdateIncidentDto } from '../../dto/update-incident.dto';

@Injectable()
export class UpdateIncidentUseCase {
  constructor(
    @Inject(INCIDENT_REPOSITORY)
    private readonly incidentRepository: IncidentRepository,
  ) {}

  async execute(id: string, dto: UpdateIncidentDto): Promise<Incident> {
    console.log(dto);
    const incident = await this.incidentRepository.findById(id);
    if (!incident) {
      throw new Error('Incident not found');
    }

    // TODO: update it later
    return incident;
  }
}
