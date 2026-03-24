import { Inject, Injectable } from '@nestjs/common';

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
export class CreateDisasterFromIncidentUseCase {
  constructor(
    @Inject(DISASTER_REPOSITORY)
    private readonly disasterRepository: DisasterRepository,
    @Inject(INCIDENT_REPOSITORY)
    private readonly incidentRepoitory: IncidentRepository,
  ) {}

  async execute(
    userId: string,
    dto: CreateDisasterDto,
    incidentId: string,
  ): Promise<Disaster> {
    // const disaster = Disaster.create(
    //   uuidv4(),
    //   dto.title,
    //   dto.description,
    //   new Date(),
    //   new Date(),
    // );

    const disaster = await this.disasterRepository.findById(incidentId);
    if (!disaster) {
      throw Error('disaster not found');
    }

    const incident = await this.incidentRepoitory.findById(incidentId);
    if (!incident) {
      throw Error('incident not found');
    }

    await this.disasterRepository.save(disaster);
    return disaster;
  }
}
