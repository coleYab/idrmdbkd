import { Inject, Injectable } from '@nestjs/common';

import { Disaster } from '../../../domain/entities/disaster.entity';
import {
  DISASTER_REPOSITORY,
  DisasterRepository,
} from '../../../domain/repositories/disaster.repository';
import { UpdateDisasterDto } from '../../dto/update-disaster.dto';

@Injectable()
export class UpdateDisasterUseCase {
  constructor(
    @Inject(DISASTER_REPOSITORY)
    private readonly incidentRepository: DisasterRepository,
  ) {}

  async execute(id: string, dto: UpdateDisasterDto): Promise<Disaster> {
    console.log(dto);
    const disaster = await this.incidentRepository.findById(id);
    if (!disaster) {
      throw new Error('Disaster not found');
    }

    return disaster;
  }
}
