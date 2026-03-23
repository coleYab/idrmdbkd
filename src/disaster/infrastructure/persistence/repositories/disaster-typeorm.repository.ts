import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Disaster } from '../../../domain/entities/disaster.entity';
import { DisasterRepository } from '../../../domain/repositories/disaster.repository';
import { DisasterTypeOrmEntity } from '../typeorm/disaster-typeorm.entity';

@Injectable()
export class DisasterTypeOrmRepository implements DisasterRepository {
  constructor(
    @InjectRepository(DisasterTypeOrmEntity)
    private readonly repository: Repository<DisasterTypeOrmEntity>,
  ) {}

  async findById(id: string): Promise<Disaster | null> {
    const entity = await this.repository.findOne({ where: { id } });
    if (!entity) return null;

    return new Disaster(
      entity.id,
      entity.title,
      entity.description,
      entity.createdAt,
      entity.updatedAt,
    );
    // return new Disaster(entity.id, entity.name, entity.description);
  }

  async findAll(): Promise<Disaster[]> {
    const entities = await this.repository.find();
    return entities.map(
      (entity) =>
        new Disaster(
          entity.id,
          entity.title,
          entity.description,
          entity.createdAt,
          entity.updatedAt,
        ),
    );
  }

  async save(incident: Disaster): Promise<void> {
    const entity = new DisasterTypeOrmEntity();
    entity.id = incident.getId();
    entity.title = incident.getTitle();
    entity.description = incident.getDescription();
    entity.createdAt = incident.getCreatedAt();
    entity.updatedAt = incident.getUpdatedAt();

    await this.repository.save(entity);
  }

  async update(incident: Disaster): Promise<void> {
    const entity = await this.repository.findOne({
      where: { id: incident.getId() },
    });
    if (!entity) throw new Error('Disaster not found');

    entity.title = incident.getTitle();
    entity.description = incident.getDescription();
    entity.createdAt = incident.getCreatedAt();
    entity.updatedAt = incident.getUpdatedAt();

    await this.repository.save(entity);
  }

  async delete(id: string): Promise<void> {
    await this.repository.delete(id);
  }
}
