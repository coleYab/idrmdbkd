import { Inject, Injectable } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';

import { IncidentStatus } from '../../../../shared/enums/incident.enums';
import { Incident } from '../../../domain/entities/incident.entity';
import {
  INCIDENT_REPOSITORY,
  IncidentRepository,
} from '../../../domain/repositories/incident.repository';
import { ReportIncidentDto } from '../../dto/create-incident.dto';

@Injectable()
export class CreateIncidentUseCase {
  constructor(
    @Inject(INCIDENT_REPOSITORY)
    private readonly incidentRepository: IncidentRepository,
  ) {}

  async execute(userId: string, dto: ReportIncidentDto): Promise<Incident> {
    const incident = Incident.create(
      uuidv4(),
      dto.title,
      dto.description,
      dto.incidentType,
      IncidentStatus.ACTIVE,
      dto.severity,
      dto.location,
      dto.attachments,
      dto.affectedPopulationCount,
      dto.requiresUrgentMedical,
      dto.infrastructureDamage,
      userId,
      new Date(),
      new Date(),
    );

    console.log(incident);
    await this.incidentRepository.save(incident);
    return incident;
  }
}
