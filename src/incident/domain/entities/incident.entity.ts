import { AggregateRoot } from '@nestjs/cqrs';

import {
  IncidentSeverityLevel,
  IncidentStatus,
  IncidentType,
} from '../../../shared/enums/incident.enums';
import { IncidentCreatedEvent } from '../events/incident-created.event';
import { IncidentUpdatedEvent } from '../events/incident-updated.event';

export class Incident extends AggregateRoot {
  private id: string;
  private title: string;
  private description: string;

  private incidentType: IncidentType;
  private status: IncidentStatus;
  private severity: IncidentSeverityLevel;

  private location: string;
  private attachments: string[];

  private affectedPopulationCount: number;
  private requiresUrgentMedical: boolean;
  private infrastructureDamage: string[];

  private reportedBy: string;

  private createdAt: Date;
  private updatedAt: Date;

  private resolvedBy?: string;
  private resolvedAt?: Date;

  constructor(
    id: string,
    title: string,
    description: string,
    incidentType: IncidentType,
    status: IncidentStatus,
    severity: IncidentSeverityLevel,
    location: string,
    attachments: string[],
    affectedPopulationCount: number,
    requiresUrgentMedical: boolean,
    infrastructureDamage: string[],
    reportedBy: string,
    createdAt: Date,
    updatedAt: Date,
    resolvedBy?: string,
    resolvedAt?: Date,
  ) {
    super();
    this.id = id;
    this.title = title;
    this.description = description;
    this.incidentType = incidentType;
    this.status = status;
    this.severity = severity;
    this.location = location;
    this.attachments = attachments;
    this.affectedPopulationCount = affectedPopulationCount;
    this.requiresUrgentMedical = requiresUrgentMedical;
    this.infrastructureDamage = infrastructureDamage;
    this.resolvedBy = resolvedBy;
    this.resolvedAt = resolvedAt;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
    this.reportedBy = reportedBy;
  }

  public getIncidentType(): IncidentType {
    return this.incidentType;
  }

  public getStatus(): IncidentStatus {
    return this.status;
  }

  public getReportedBy(): string {
    return this.reportedBy;
  }

  private static readonly ALLOWED_TRANSITIONS: Record<IncidentStatus, IncidentStatus[]> = {
    [IncidentStatus.PENDING]: [IncidentStatus.ACTIVE, IncidentStatus.REJECTED],
    [IncidentStatus.ACTIVE]: [IncidentStatus.RESOLVED],
    [IncidentStatus.RESOLVED]: [],
    [IncidentStatus.REJECTED]: [],
    [IncidentStatus.VERIFIED]: [],
    [IncidentStatus.REPEATED]: [],
    [IncidentStatus.FALSE_ALARM]: [],
  };

  public transitionStatus(newStatus: IncidentStatus, userId?: string): void {
    const allowed = Incident.ALLOWED_TRANSITIONS[this.status];
    if (!allowed || !allowed.includes(newStatus)) {
      throw new Error(
        `Cannot transition incident from ${this.status} to ${newStatus}`,
      );
    }

    this.status = newStatus;
    this.updatedAt = new Date();

    if (userId && (newStatus === IncidentStatus.RESOLVED || newStatus === IncidentStatus.REJECTED)) {
      this.resolvedBy = userId;
      this.resolvedAt = new Date();
    }

    this.apply(new IncidentUpdatedEvent(this));
  }

  public getSeverity(): IncidentSeverityLevel {
    return this.severity;
  }

  public getLocation(): string {
    return this.location;
  }

  public getAttachments(): string[] {
    return this.attachments;
  }

  public getAffectedPopulationCount(): number {
    return this.affectedPopulationCount;
  }

  public getIsUrgentMedicalRequired(): boolean {
    return this.requiresUrgentMedical;
  }

  public getInfrastructureDamage(): string[] {
    return this.infrastructureDamage;
  }

  public getResolvedBy(): string | undefined {
    return this.resolvedBy;
  }

  public getResolvedAt(): Date | undefined {
    return this.resolvedAt;
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
    incidentType: IncidentType,
    status: IncidentStatus,
    severity: IncidentSeverityLevel,
    location: string,
    attachments: string[],
    affectedPopulationCount: number,
    requiresUrgentMedical: boolean,
    infrastructureDamage: string[],
    reportedBy: string,
    resolvedBy?: string,
    resolvedAt?: Date,
  ): void {
    this.title = title;
    this.description = description;
    this.incidentType = incidentType;
    this.status = status;
    this.severity = severity;
    this.location = location;
    this.attachments = attachments;
    this.affectedPopulationCount = affectedPopulationCount;
    this.requiresUrgentMedical = requiresUrgentMedical;
    this.infrastructureDamage = infrastructureDamage;
    this.updatedAt = new Date();
    this.reportedBy = reportedBy;
    this.resolvedBy = resolvedBy;
    this.resolvedAt = resolvedAt;
    this.apply(new IncidentUpdatedEvent(this));
  }

  public static create(
    id: string,
    title: string,
    description: string,
    incidentType: IncidentType,
    status: IncidentStatus,
    severity: IncidentSeverityLevel,
    location: string,
    attachments: string[],
    affectedPopulationCount: number,
    requiresUrgentMedical: boolean,
    infrastructureDamage: string[],
    reportedBy: string,
    createdAt: Date,
    updatedAt: Date,
    resolvedBy?: string,
    resolvedAt?: Date,
  ): Incident {
    const incident = new Incident(
      id,
      title,
      description,
      incidentType,
      status,
      severity,
      location,
      attachments,
      affectedPopulationCount,
      requiresUrgentMedical,
      infrastructureDamage,
      reportedBy,
      createdAt,
      updatedAt,
      resolvedBy,
      resolvedAt,
    );

    incident.apply(new IncidentCreatedEvent(incident));
    return incident;
  }
}
