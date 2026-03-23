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
    private readonly incidentRepository: DisasterRepository,
  ) {}

  async execute(userId: string, dto: CreateDisasterDto): Promise<Disaster> {
    const disaster = Disaster.create(
      uuidv4(),
      dto.title,
      dto.description,
      new Date(),
      new Date(),
    );

    console.log(disaster);
    await this.incidentRepository.save(disaster);
    return disaster;
  }
}
