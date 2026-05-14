import { Inject, Injectable } from '@nestjs/common';

import { Resource } from '../../domain/entities/resource.entity';
import {
  RESOURCE_REPOSITORY,
  ResourceRepository,
} from '../../domain/repositories/resource.repository';

@Injectable()
export class ResourceService {
  constructor(
    @Inject(RESOURCE_REPOSITORY)
    private readonly resourceRepository: ResourceRepository,
  ) {}

  public async findAll(): Promise<Resource[]> {
    return this.resourceRepository.findAll();
  }

  public async findOne(id: string): Promise<Resource | null> {
    return this.resourceRepository.findById(id);
  }

  public async findByCategory(category: string): Promise<Resource[]> {
    return this.resourceRepository.findByCategory(category);
  }

  public async findByName(name: string): Promise<Resource[]> {
    return this.resourceRepository.findByName(name);
  }

  public async create(resource: Resource): Promise<void> {
    await this.resourceRepository.save(resource);
  }

  public async update(resource: Resource): Promise<void> {
    await this.resourceRepository.update(resource);
  }

  public async delete(id: string): Promise<void> {
    await this.resourceRepository.delete(id);
  }
}
