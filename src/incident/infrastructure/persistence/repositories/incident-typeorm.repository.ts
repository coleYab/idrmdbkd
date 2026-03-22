import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Incident } from '../../../domain/entities/incident.entity';
import { IncidentRepository } from '../../../domain/repositories/incident.repository';
import { IncidentTypeOrmEntity } from '../typeorm/incident-typeorm.entity';

@Injectable()
export class IncidentTypeOrmRepository implements IncidentRepository {
  constructor(
    @InjectRepository(IncidentTypeOrmEntity)
    private readonly repository: Repository<IncidentTypeOrmEntity>,
  ) {}

  async findById(id: string): Promise<Incident | null> {
    const entity = await this.repository.findOne({ where: { id } });
    if (!entity) return null;

    return new Incident(
      entity.id,
      entity.title,
      entity.description,
      entity.incidentType,
      entity.status,
      entity.severity,
      entity.location,
      entity.attachments,
      entity.affectedPopulationCount,
      entity.requiresUrgentMedical,
      entity.infrastructureDamage,
      entity.createdAt,
      entity.updatedAt,
      entity.resolvedBy,
      entity.resolvedAt,
    );
    // return new Incident(entity.id, entity.name, entity.description);
  }

  async findAll(): Promise<Incident[]> {
    const entities = await this.repository.find();
    return entities.map(
      (entity) =>
        new Incident(
          entity.id,
          entity.title,
          entity.description,
          entity.incidentType,
          entity.status,
          entity.severity,
          entity.location,
          entity.attachments,
          entity.affectedPopulationCount,
          entity.requiresUrgentMedical,
          entity.infrastructureDamage,
          entity.createdAt,
          entity.updatedAt,
          entity.resolvedBy,
          entity.resolvedAt,
        ),
    );
  }

  async save(incident: Incident): Promise<void> {
    const entity = new IncidentTypeOrmEntity();
    entity.id = incident.getId();
    entity.title = incident.getTitle();
    entity.description = incident.getDescription();
    entity.incidentType = incident.getIncidentType();
    entity.status = incident.getStatus();
    entity.severity = incident.getSeverity();
    entity.location = incident.getLocation();
    entity.attachments = incident.getAttachments();
    entity.affectedPopulationCount = incident.getAffectedPopulationCount();
    entity.requiresUrgentMedical = incident.getIsUrgentMedicalRequired();
    entity.infrastructureDamage = incident.getInfrastructureDamage();
    entity.createdAt = incident.getCreatedAt();
    entity.updatedAt = incident.getUpdatedAt();

    await this.repository.save(entity);
  }

  async update(incident: Incident): Promise<void> {
    const entity = await this.repository.findOne({
      where: { id: incident.getId() },
    });
    if (!entity) throw new Error('Incident not found');

    entity.title = incident.getTitle();
    entity.description = incident.getDescription();
    entity.incidentType = incident.getIncidentType();
    entity.status = incident.getStatus();
    entity.severity = incident.getSeverity();
    entity.location = incident.getLocation();
    entity.attachments = incident.getAttachments();
    entity.affectedPopulationCount = incident.getAffectedPopulationCount();
    entity.requiresUrgentMedical = incident.getIsUrgentMedicalRequired();
    entity.infrastructureDamage = incident.getInfrastructureDamage();
    entity.createdAt = incident.getCreatedAt();
    entity.updatedAt = incident.getUpdatedAt();

    await this.repository.save(entity);
  }

  async delete(id: string): Promise<void> {
    await this.repository.delete(id);
  }
}
