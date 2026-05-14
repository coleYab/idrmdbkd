import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { ResourceNeed } from '../../../domain/entities/resource-need.entity';
import { ResourceNeedRepository } from '../../../domain/repositories/resource-need.repository';
import { ResourceNeedTypeOrmEntity } from '../typeorm/resource-need-typeorm.entity';

@Injectable()
export class ResourceNeedTypeOrmRepository implements ResourceNeedRepository {
  constructor(
    @InjectRepository(ResourceNeedTypeOrmEntity)
    private readonly repository: Repository<ResourceNeedTypeOrmEntity>,
  ) {}

  private toDomain(entity: ResourceNeedTypeOrmEntity): ResourceNeed {
    return new ResourceNeed(
      entity.needID,
      entity.resourceID,
      entity.quantityRequired,
      entity.fulfilledQuantity,
      entity.priority as any,
      entity.status as any,
      entity.createdAt,
      entity.updatedAt,
      entity.incidentID,
    );
  }

  async findById(id: string): Promise<ResourceNeed | null> {
    const entity = await this.repository.findOne({ where: { needID: id } });
    if (!entity) return null;
    return this.toDomain(entity);
  }

  async findAll(): Promise<ResourceNeed[]> {
    const entities = await this.repository.find();
    return entities.map((entity) => this.toDomain(entity));
  }

  async findByStatus(status: string): Promise<ResourceNeed[]> {
    const entities = await this.repository.find({
      where: { status: status as any },
    });
    return entities.map((entity) => this.toDomain(entity));
  }

  async findByPriority(priority: string): Promise<ResourceNeed[]> {
    const entities = await this.repository.find({
      where: { priority: priority as any },
    });
    return entities.map((entity) => this.toDomain(entity));
  }

  async findByResourceId(resourceID: string): Promise<ResourceNeed[]> {
    const entities = await this.repository.find({ where: { resourceID } });
    return entities.map((entity) => this.toDomain(entity));
  }

  async save(need: ResourceNeed): Promise<void> {
    const entity = new ResourceNeedTypeOrmEntity();
    entity.needID = need.getNeedID();
    entity.resourceID = need.getResourceID();
    entity.quantityRequired = need.getQuantityRequired();
    entity.fulfilledQuantity = need.getFulfilledQuantity();
    entity.priority = need.getPriority() as any;
    entity.status = need.getStatus() as any;
    entity.incidentID = need.getIncidentID();
    entity.createdAt = need.getCreatedAt();
    entity.updatedAt = need.getUpdatedAt();
    await this.repository.save(entity);
  }

  async update(need: ResourceNeed): Promise<void> {
    const entity = await this.repository.findOne({
      where: { needID: need.getNeedID() },
    });
    if (!entity) throw new Error('Resource need not found');
    entity.resourceID = need.getResourceID();
    entity.quantityRequired = need.getQuantityRequired();
    entity.fulfilledQuantity = need.getFulfilledQuantity();
    entity.priority = need.getPriority() as any;
    entity.status = need.getStatus() as any;
    entity.updatedAt = need.getUpdatedAt();
    await this.repository.save(entity);
  }

  async delete(id: string): Promise<void> {
    await this.repository.delete({ needID: id });
  }
}
