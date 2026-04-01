import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Donation } from '../../../domain/entities/donation.entity';
import { DonationRepository } from '../../../domain/repositories/donation.repository';
import { DonationTypeOrmEntity } from '../typeorm/donation-typeorm.entity';

@Injectable()
export class DonationTypeOrmRepository implements DonationRepository {
  constructor(
    @InjectRepository(DonationTypeOrmEntity)
    private readonly repository: Repository<DonationTypeOrmEntity>,
  ) {}

  async findById(id: string): Promise<Donation | null> {
    const entity = await this.repository.findOne({ where: { id } });
    if (!entity) return null;

    return new Donation(
      entity.id,
      entity.title,
      entity.description,
      entity.createdAt,
      entity.updatedAt,
    );
  }

  async findAll(): Promise<Donation[]> {
    const entities = await this.repository.find();
    return entities.map(
      (entity) =>
        new Donation(
          entity.id,
          entity.title,
          entity.description,
          entity.createdAt,
          entity.updatedAt,
        ),
    );
  }

  async save(disaster: Donation): Promise<void> {
    const entity = new DonationTypeOrmEntity();
    entity.id = disaster.getId();
    entity.title = disaster.getTitle();
    entity.description = disaster.getDescription();
    entity.createdAt = disaster.getCreatedAt();
    entity.updatedAt = disaster.getUpdatedAt();
    await this.repository.save(entity);
  }

  async update(disaster: Donation): Promise<void> {
    const entity = await this.repository.findOne({
      where: { id: disaster.getId() },
    });
    if (!entity) throw new Error('Donation not found');
    entity.id = disaster.getId();
    entity.title = disaster.getTitle();
    entity.description = disaster.getDescription();
    entity.createdAt = disaster.getCreatedAt();
    entity.updatedAt = disaster.getUpdatedAt();
    await this.repository.save(entity);
  }

  async delete(id: string): Promise<void> {
    await this.repository.delete(id);
  }
}
