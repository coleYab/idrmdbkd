import { AggregateRoot } from '@nestjs/cqrs';

export enum ERTUnitStatus {
  IDLE = 'idle',
  DEPLOYED = 'deployed',
  MAINTENANCE = 'maintenance',
}

export class ErtUnit extends AggregateRoot {
  private unitID: string;
  private name: string;
  private status: ERTUnitStatus;
  private region?: string;
  // GeoJSON Point: { type: 'Point', coordinates: [lon, lat] }
  private location?: any;
  private createdAt: Date;
  private updatedAt: Date;

  constructor(
    unitID: string,
    name: string,
    status: ERTUnitStatus,
    createdAt: Date,
    updatedAt: Date,
    region?: string,
    location?: any,
  ) {
    super();
    this.unitID = unitID;
    this.name = name;
    this.status = status;
    this.region = region;
    this.location = location;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
  }

  public getUnitID(): string {
    return this.unitID;
  }

  public getName(): string {
    return this.name;
  }

  public getStatus(): ERTUnitStatus {
    return this.status;
  }

  public getRegion(): string | undefined {
    return this.region;
  }

  public getLocation(): any | undefined {
    return this.location;
  }

  public getCreatedAt(): Date {
    return this.createdAt;
  }

  public getUpdatedAt(): Date {
    return this.updatedAt;
  }

  public updateStatus(status: ERTUnitStatus): void {
    this.status = status;
    this.updatedAt = new Date();
  }

  public updateLocation(location: any): void {
    this.location = location;
    this.updatedAt = new Date();
  }
}
