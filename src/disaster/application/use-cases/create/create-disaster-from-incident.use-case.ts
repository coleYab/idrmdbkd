import { Inject, Injectable } from '@nestjs/common';

import {
  INCIDENT_REPOSITORY,
  IncidentRepository,
} from '../../../../incident/domain/repositories/incident.repository';
import {
  DisasterSeverityLevel,
  DisasterStatus,
  DisasterType,
} from '../../../../shared/enums/disaster.enums';
import {
  IncidentSeverityLevel,
  IncidentStatus,
  IncidentType,
} from '../../../../shared/enums/incident.enums';
import { Disaster } from '../../../domain/entities/disaster.entity';
import {
  DISASTER_REPOSITORY,
  DisasterRepository,
} from '../../../domain/repositories/disaster.repository';
import { CreateDisasterDto } from '../../dto/create-disaster.dto';
import { CreateDisasterUseCase } from './create-disaster.use-case';

@Injectable()
export class CreateDisasterFromIncidentUseCase {
  constructor(
    private readonly createDisasterUseCase: CreateDisasterUseCase,

    @Inject(DISASTER_REPOSITORY)
    private readonly disasterRepository: DisasterRepository,

    @Inject(INCIDENT_REPOSITORY)
    private readonly incidentRepository: IncidentRepository,
  ) {}

  async execute(userId: string, incidentId: string): Promise<Disaster> {
    const incident = await this.incidentRepository.findById(incidentId);
    if (!incident) {
      throw new Error('Incident not found');
    }

    if (incident.getStatus() !== IncidentStatus.VERIFIED) {
      throw new Error(
        'Incident must be resolved first to create a disaster from an incident',
      );
    }

    const createDisasterDto: CreateDisasterDto = {
      title: incident.getTitle(),
      description: incident.getDescription(),

      type: this.mapIncidentTypeToDisasterType(incident.getIncidentType()),
      status: this.mapIncidentStatusToDisasterStatus(incident.getStatus()),
      severity: this.mapIncidentSeverityToDisasterSeverity(
        incident.getSeverity(),
      ),
      location: incident.getLocation(),
      totalAffectedPopulation: incident.getAffectedPopulationCount(),
      requiresUrgentMedical: incident.getIsUrgentMedicalRequired(),
      infrastructureDamage: incident.getInfrastructureDamage(),
      attachments: incident.getAttachments(),
      estimatedEconomicLoss: 0,
      budgetAllocated: 0,
      linkedIncidentIds: [incident.getId()],
    };

    return await this.createDisasterUseCase.execute(userId, createDisasterDto);
  }

  private mapIncidentTypeToDisasterType(type: IncidentType): DisasterType {
    return type.toString() as DisasterType;
  }

  private mapIncidentStatusToDisasterStatus(
    status: IncidentStatus,
  ): DisasterStatus {
    return status.toString() as DisasterStatus;
  }

  private mapIncidentSeverityToDisasterSeverity(
    severity: IncidentSeverityLevel,
  ): DisasterSeverityLevel {
    return severity.toString() as DisasterSeverityLevel;
  }
}
