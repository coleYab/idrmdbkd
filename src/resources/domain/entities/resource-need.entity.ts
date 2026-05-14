import { AggregateRoot } from '@nestjs/cqrs';

export enum ResourceNeedPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
}

export enum ResourceNeedStatus {
  PENDING = 'pending',
  IN_PROGRESS = 'in_progress',
  SATISFIED = 'satisfied',
}

export class ResourceNeed extends AggregateRoot {
  private needID: string;
  private resourceID: string;
  private quantityRequired: number;
  private fulfilledQuantity: number;
  private priority: ResourceNeedPriority;
  private status: ResourceNeedStatus;
  private incidentID?: string;
  private createdAt: Date;
  private updatedAt: Date;

  constructor(
    needID: string,
    resourceID: string,
    quantityRequired: number,
    fulfilledQuantity: number,
    priority: ResourceNeedPriority,
    status: ResourceNeedStatus,
    createdAt: Date,
    updatedAt: Date,
    incidentID?: string,
  ) {
    super();
    this.needID = needID;
    this.resourceID = resourceID;
    this.quantityRequired = quantityRequired;
    this.fulfilledQuantity = fulfilledQuantity;
    this.priority = priority;
    this.status = status;
    this.incidentID = incidentID;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
  }

  public getNeedID(): string {
    return this.needID;
  }

  public getResourceID(): string {
    return this.resourceID;
  }

  public getQuantityRequired(): number {
    return this.quantityRequired;
  }

  public getFulfilledQuantity(): number {
    return this.fulfilledQuantity;
  }

  public getPriority(): ResourceNeedPriority {
    return this.priority;
  }

  public getStatus(): ResourceNeedStatus {
    return this.status;
  }

  public getIncidentID(): string | undefined {
    return this.incidentID;
  }

  public getCreatedAt(): Date {
    return this.createdAt;
  }

  public getUpdatedAt(): Date {
    return this.updatedAt;
  }

  public updateStatus(status: ResourceNeedStatus): void {
    this.status = status;
    this.updatedAt = new Date();
  }

  public updateFulfilledQuantity(quantity: number): void {
    this.fulfilledQuantity = quantity;
    this.updatedAt = new Date();
  }

  public approve(): void {
    this.status = ResourceNeedStatus.IN_PROGRESS;
    this.updatedAt = new Date();
  }

  public getFulfillmentProgress(): {
    fulfilled: number;
    required: number;
    percentage: number;
  } {
    const percentage =
      this.quantityRequired > 0
        ? Math.round((this.fulfilledQuantity / this.quantityRequired) * 100)
        : 0;
    return {
      fulfilled: this.fulfilledQuantity,
      required: this.quantityRequired,
      percentage,
    };
  }
}
