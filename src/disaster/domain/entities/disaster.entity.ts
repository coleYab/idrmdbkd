import { AggregateRoot } from '@nestjs/cqrs';

import {
  DisasterSeverityLevel,
  DisasterStatus,
  DisasterType,
} from '../../../shared/enums/disaster.enums';
import { DisasterCreatedEvent } from '../events/disaster-created.event';
import { DisasterUpdatedEvent } from '../events/disaster-updated.event';

export class Disaster extends AggregateRoot {
  private id: string;
  private title: string;
  private description: string;

  private type: DisasterType;
  private status: DisasterStatus;
  private severity: DisasterSeverityLevel;

  private location: string;
  private totalAffectedPopulation: number;
  private requiresUrgentMedical: boolean;

  private infrastructureDamage: string[];
  private attachments: string[];

  private estimatedEconomicLoss: number;
  private budgetAllocated: number;

  private declaredBy: string; // The Disaster Manager ID
  private linkedIncidentIds: string[]; // For traceability only

  private createdAt: Date;
  private updatedAt: Date;

  private activatedAt?: Date;
  private closedAt?: Date;

  constructor(
    id: string,
    title: string,
    description: string,
    type: DisasterType,
    status: DisasterStatus,
    severity: DisasterSeverityLevel,
    location: string,
    totalAffectedPopulation: number,
    requiresUrgentMedical: boolean,
    infrastructureDamage: string[],
    attachments: string[],
    estimatedEconomicLoss: number,
    budgetAllocated: number,
    declaredBy: string,
    linkedIncidentIds: string[],
    createdAt: Date,
    updatedAt: Date,
    activatedAt?: Date,
    closedAt?: Date,
  ) {
    super();
    this.id = id;
    this.title = title;
    this.description = description;
    this.type = type;
    this.status = status;
    this.severity = severity;
    this.location = location;
    this.totalAffectedPopulation = totalAffectedPopulation;
    this.requiresUrgentMedical = requiresUrgentMedical;
    this.infrastructureDamage = infrastructureDamage;
    this.attachments = attachments;
    this.estimatedEconomicLoss = estimatedEconomicLoss;
    this.budgetAllocated = budgetAllocated;
    this.declaredBy = declaredBy;
    this.linkedIncidentIds = linkedIncidentIds;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
    this.activatedAt = activatedAt;
    this.closedAt = closedAt;
  }

  public getStatus(): DisasterStatus {
    return this.status;
  }

  public getSeverity(): DisasterSeverityLevel {
    return this.severity;
  }

  public getLocation(): string {
    return this.location;
  }

  public getTotalAffectedPopulation(): number {
    return this.totalAffectedPopulation;
  }

  public getRequiresUrgentMedical(): boolean {
    return this.requiresUrgentMedical;
  }

  public getInfrastructureDamage(): string[] {
    return this.infrastructureDamage;
  }

  public getAttachments(): string[] {
    return this.attachments;
  }

  public getEstimatedEconomicLoss(): number {
    return this.estimatedEconomicLoss;
  }

  public getBudgetAllocated(): number {
    return this.budgetAllocated;
  }

  public getDeclaredBy(): string {
    return this.declaredBy;
  }

  public getLinkedIncidentIds(): string[] {
    return this.linkedIncidentIds;
  }

  public getActivatedAt(): Date | undefined {
    return this.activatedAt;
  }

  public getClosedAt(): Date | undefined {
    return this.closedAt;
  }

  public getType(): DisasterType {
    return this.type;
  }

  public getId(): string {
    return this.id;
  }

  public getTitle(): string {
    return this.title;
  }

  public getDescription(): string {
    return this.description;
  }

  public getCreatedAt(): Date {
    return this.createdAt;
  }

  public getUpdatedAt(): Date {
    return this.updatedAt;
  }

  public update(
    title: string,
    description: string,
    type: DisasterType,
    status: DisasterStatus,
    severity: DisasterSeverityLevel,
    location: string,
    totalAffectedPopulation: number,
    requiresUrgentMedical: boolean,
    infrastructureDamage: string[],
    attachments: string[],
    estimatedEconomicLoss: number,
    budgetAllocated: number,
    declaredBy: string,
    linkedIncidentIds: string[],
    activatedAt?: Date,
    closedAt?: Date,
  ): void {
    this.title = title;
    this.description = description;
    this.type = type;
    this.status = status;
    this.severity = severity;
    this.location = location;
    this.totalAffectedPopulation = totalAffectedPopulation;
    this.requiresUrgentMedical = requiresUrgentMedical;
    this.infrastructureDamage = infrastructureDamage;
    this.attachments = attachments;
    this.estimatedEconomicLoss = estimatedEconomicLoss;
    this.budgetAllocated = budgetAllocated;
    this.declaredBy = declaredBy;
    this.linkedIncidentIds = linkedIncidentIds;
    this.activatedAt = activatedAt;
    this.closedAt = closedAt;
    this.updatedAt = new Date();
    this.apply(new DisasterUpdatedEvent(this));
  }

  public static create(
    id: string,
    title: string,
    description: string,
    type: DisasterType,
    status: DisasterStatus,
    severity: DisasterSeverityLevel,
    location: string,
    totalAffectedPopulation: number,
    requiresUrgentMedical: boolean,
    infrastructureDamage: string[],
    attachments: string[],
    estimatedEconomicLoss: number,
    budgetAllocated: number,
    declaredBy: string,
    linkedIncidentIds: string[],
    createdAt: Date,
    updatedAt: Date,
    activatedAt?: Date,
    closedAt?: Date,
  ): Disaster {
    const incident = new Disaster(
      id,
      title,
      description,
      type,
      status,
      severity,
      location,
      totalAffectedPopulation,
      requiresUrgentMedical,
      infrastructureDamage,
      attachments,
      estimatedEconomicLoss,
      budgetAllocated,
      declaredBy,
      linkedIncidentIds,
      createdAt,
      updatedAt,
      activatedAt,
      closedAt,
    );

    incident.apply(new DisasterCreatedEvent(incident));
    return incident;
  }
}
