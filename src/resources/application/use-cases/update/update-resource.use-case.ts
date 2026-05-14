import { Inject, Injectable } from '@nestjs/common';

import { Resource } from '../../../domain/entities/resource.entity';
import {
  RESOURCE_REPOSITORY,
  ResourceRepository,
} from '../../../domain/repositories/resource.repository';
import { UpdateResourceDto } from '../../dto/update-resource.dto';

@Injectable()
export class UpdateResourceUseCase {
  constructor(
    @Inject(RESOURCE_REPOSITORY)
    private readonly resourceRepository: ResourceRepository,
  ) {}

  async execute(id: string, dto: UpdateResourceDto): Promise<Resource> {
    const resource = await this.resourceRepository.findById(id);
    if (!resource) {
      throw new Error('Resource not found');
    }

    resource.update(
      dto.name ?? resource.getName(),
      dto.category ?? resource.getCategory(),
      dto.quantity ?? resource.getQuantity(),
    );

    await this.resourceRepository.update(resource);

    return resource;
  }
}
