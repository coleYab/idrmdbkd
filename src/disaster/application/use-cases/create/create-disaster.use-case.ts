import { Inject, Injectable } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';

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
  ) {}

  async execute(userId: string, dto: CreateDisasterDto): Promise<Disaster> {
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
