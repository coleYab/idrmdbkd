import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Location } from '../../../domain/entities/location.entity';
import { LocationRepository } from '../../../domain/repositories/location.repository';
import { LocationTypeOrmEntity } from '../typeorm/location-typeorm.entity';

@Injectable()
export class LocationTypeOrmRepository implements LocationRepository {
  constructor(
    @InjectRepository(LocationTypeOrmEntity)
    private readonly repository: Repository<LocationTypeOrmEntity>,
  ) {}

  async findById(id: string): Promise<Location | null> {
    const entity = await this.repository.findOne({ where: { id } });
    if (!entity) return null;

    return new Location(
      entity.id,
      entity.name,
      entity.description,
      entity.createdAt,
      entity.updatedAt,
    );
  }

  async findAll(): Promise<Location[]> {
    const entities = await this.repository.find();
    return entities.map(
      (entity) =>
        new Location(
          entity.id,
          entity.name,
          entity.description,
          entity.createdAt,
          entity.updatedAt,
        ),
    );
  }

  async save(location: Location): Promise<void> {
    const entity = new LocationTypeOrmEntity();
    entity.id = location.getId();
    entity.name = location.getName();
    entity.description = location.getDescription();
    entity.createdAt = location.getCreatedAt();
    entity.updatedAt = location.getUpdatedAt();
    await this.repository.save(entity);
  }

  async update(location: Location): Promise<void> {
    const entity = await this.repository.findOne({
      where: { id: location.getId() },
    });
    if (!entity) throw new Error('Location not found');
    entity.id = location.getId();
    entity.name = location.getName();
    entity.description = location.getDescription();
    entity.createdAt = location.getCreatedAt();
    entity.updatedAt = location.getUpdatedAt();
    await this.repository.save(entity);
  }

  async delete(id: string): Promise<void> {
    await this.repository.delete(id);
  }
}
