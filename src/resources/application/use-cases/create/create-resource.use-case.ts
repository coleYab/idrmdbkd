import { Inject, Injectable } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';

import { Resource } from '../../../domain/entities/resource.entity';
import {
  RESOURCE_REPOSITORY,
  ResourceRepository,
} from '../../../domain/repositories/resource.repository';
import { CreateResourceDto } from '../../dto/create-resource.dto';

@Injectable()
export class CreateResourceUseCase {
  constructor(
    @Inject(RESOURCE_REPOSITORY)
    private readonly resourceRepository: ResourceRepository,
  ) {}

  async execute(userId: string, dto: CreateResourceDto): Promise<Resource> {
    const resource = new Resource(
      uuidv4(),
      dto.name,
      dto.category,
      dto.quantity,
      new Date(),
      new Date(),
    );

    await this.resourceRepository.save(resource);
    return resource;
  }
}
