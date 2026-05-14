import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Like,Repository } from 'typeorm';

import { Resource } from '../../../domain/entities/resource.entity';
import { ResourceRepository } from '../../../domain/repositories/resource.repository';
import { ResourceTypeOrmEntity } from '../typeorm/resource-typeorm.entity';

@Injectable()
export class ResourceTypeOrmRepository implements ResourceRepository {
  constructor(
    @InjectRepository(ResourceTypeOrmEntity)
    private readonly repository: Repository<ResourceTypeOrmEntity>,
  ) {}

  async findById(id: string): Promise<Resource | null> {
    const entity = await this.repository.findOne({ where: { resourceID: id } });
    if (!entity) return null;

    return new Resource(
      entity.resourceID,
      entity.name,
      entity.category,
      entity.quantity,
      entity.createdAt,
      entity.updatedAt,
    );
  }

  async findAll(): Promise<Resource[]> {
    const entities = await this.repository.find();
    return entities.map(
      (entity) =>
        new Resource(
          entity.resourceID,
          entity.name,
          entity.category,
          entity.quantity,
          entity.createdAt,
          entity.updatedAt,
        ),
    );
  }

  async findByCategory(category: string): Promise<Resource[]> {
    const entities = await this.repository.find({
      where: { category: Like(`%${category}%`) },
    });
    return entities.map(
      (entity) =>
        new Resource(
          entity.resourceID,
          entity.name,
          entity.category,
          entity.quantity,
          entity.createdAt,
          entity.updatedAt,
        ),
    );
  }

  async findByName(name: string): Promise<Resource[]> {
    const entities = await this.repository.find({
      where: { name: Like(`%${name}%`) },
    });
    return entities.map(
      (entity) =>
        new Resource(
          entity.resourceID,
          entity.name,
          entity.category,
          entity.quantity,
          entity.createdAt,
          entity.updatedAt,
        ),
    );
  }

  async save(resource: Resource): Promise<void> {
    const entity = new ResourceTypeOrmEntity();
    entity.resourceID = resource.getResourceID();
    entity.name = resource.getName();
    entity.category = resource.getCategory();
    entity.quantity = resource.getQuantity();
    entity.createdAt = resource.getCreatedAt();
    entity.updatedAt = resource.getUpdatedAt();
    await this.repository.save(entity);
  }

  async update(resource: Resource): Promise<void> {
    const entity = await this.repository.findOne({
      where: { resourceID: resource.getResourceID() },
    });
    if (!entity) throw new Error('Resource not found');
    entity.resourceID = resource.getResourceID();
    entity.name = resource.getName();
    entity.category = resource.getCategory();
    entity.quantity = resource.getQuantity();
    entity.updatedAt = resource.getUpdatedAt();
    await this.repository.save(entity);
  }

  async delete(id: string): Promise<void> {
    await this.repository.delete({ resourceID: id });
  }
}
