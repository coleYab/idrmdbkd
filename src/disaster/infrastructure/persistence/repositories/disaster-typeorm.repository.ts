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
      entity.type,
      entity.status,
      entity.severity,
      entity.location,
      entity.totalAffectedPopulation,
      entity.requiresUrgentMedical,
      entity.infrastructureDamage,
      entity.attachments,
      entity.estimatedEconomicLoss,
      entity.budgetAllocated,
      entity.declaredBy,
      entity.linkedIncidentIds,
      entity.createdAt,
      entity.updatedAt,
      entity.activatedAt,
      entity.closedAt,
    );
  }

  async findAll(): Promise<Disaster[]> {
    const entities = await this.repository.find();
    return entities.map(
      (entity) =>
        new Disaster(
          entity.id,
          entity.title,
          entity.description,
          entity.type,
          entity.status,
          entity.severity,
          entity.location,
          entity.totalAffectedPopulation,
          entity.requiresUrgentMedical,
          entity.infrastructureDamage,
          entity.attachments,
          entity.estimatedEconomicLoss,
          entity.budgetAllocated,
          entity.declaredBy,
          entity.linkedIncidentIds,
          entity.createdAt,
          entity.updatedAt,
          entity.activatedAt,
          entity.closedAt,
        ),
    );
  }

  async save(disaster: Disaster): Promise<void> {
    const entity = new DisasterTypeOrmEntity();
    entity.id = disaster.getId();
    entity.title = disaster.getTitle();
    entity.description = disaster.getDescription();
    entity.type = disaster.getType();
    entity.status = disaster.getStatus();
    entity.severity = disaster.getSeverity();
    entity.location = disaster.getLocation();
    entity.totalAffectedPopulation = disaster.getTotalAffectedPopulation();
    entity.requiresUrgentMedical = disaster.getRequiresUrgentMedical();
    entity.infrastructureDamage = disaster.getInfrastructureDamage();
    entity.attachments = disaster.getAttachments();
    entity.estimatedEconomicLoss = disaster.getEstimatedEconomicLoss();
    entity.budgetAllocated = disaster.getBudgetAllocated();
    entity.declaredBy = disaster.getDeclaredBy();
    entity.linkedIncidentIds = disaster.getLinkedIncidentIds();
    entity.createdAt = disaster.getCreatedAt();
    entity.updatedAt = disaster.getUpdatedAt();
    entity.activatedAt = disaster.getActivatedAt();
    entity.closedAt = disaster.getClosedAt();

    await this.repository.save(entity);
  }

  async update(disaster: Disaster): Promise<void> {
    const entity = await this.repository.findOne({
      where: { id: disaster.getId() },
    });
    if (!entity) throw new Error('Disaster not found');
    entity.id = disaster.getId();
    entity.title = disaster.getTitle();
    entity.description = disaster.getDescription();
    entity.type = disaster.getType();
    entity.status = disaster.getStatus();
    entity.severity = disaster.getSeverity();
    entity.location = disaster.getLocation();
    entity.totalAffectedPopulation = disaster.getTotalAffectedPopulation();
    entity.requiresUrgentMedical = disaster.getRequiresUrgentMedical();
    entity.infrastructureDamage = disaster.getInfrastructureDamage();
    entity.attachments = disaster.getAttachments();
    entity.estimatedEconomicLoss = disaster.getEstimatedEconomicLoss();
    entity.budgetAllocated = disaster.getBudgetAllocated();
    entity.declaredBy = disaster.getDeclaredBy();
    entity.linkedIncidentIds = disaster.getLinkedIncidentIds();
    entity.createdAt = disaster.getCreatedAt();
    entity.updatedAt = disaster.getUpdatedAt();
    entity.activatedAt = disaster.getActivatedAt();
    entity.closedAt = disaster.getClosedAt();

    await this.repository.save(entity);
  }

  async delete(id: string): Promise<void> {
    await this.repository.delete(id);
  }
}
