import { Inject, Injectable } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';

import {
  INCIDENT_REPOSITORY,
  IncidentRepository,
} from '../../../../incident/domain/repositories/incident.repository';
import { Disaster } from '../../../domain/entities/disaster.entity';
import {
  DISASTER_REPOSITORY,
  DisasterRepository,
} from '../../../domain/repositories/disaster.repository';
import { CreateDisasterDto } from '../../dto/create-disaster.dto';

@Injectable()
export class CreateDisasterUseCase {
  constructor(
    @Inject(DISASTER_REPOSITORY)
    private readonly disasterRepository: DisasterRepository,
    @Inject(INCIDENT_REPOSITORY)
    private readonly incidentRepository: IncidentRepository,
  ) {}

  async execute(userId: string, dto: CreateDisasterDto): Promise<Disaster> {
    for (const incidentId of dto.linkedIncidentIds || []) {
      const incident = this.incidentRepository.findById(incidentId);
      if (!incident) {
        throw new Error(`Incident ${incidentId} not found!`);
      }
    }

    const disaster = Disaster.create(
      uuidv4(),
      dto.title,
      dto.description,
      dto.type,
      dto.status,
      dto.severity,
      dto.location,
      dto.totalAffectedPopulation,
      dto.requiresUrgentMedical || false,
      dto.infrastructureDamage || [],
      dto.attachments || [],
      dto.estimatedEconomicLoss || 0,
      dto.budgetAllocated || 0,
      userId,
      dto.linkedIncidentIds || [],
      new Date(),
      new Date(),
    );

    await this.disasterRepository.save(disaster);
    return disaster;
  }
}
