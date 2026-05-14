import { AggregateRoot } from '@nestjs/cqrs';

export class Resource extends AggregateRoot {
  private resourceID: string;
  private name: string;
  private category: string;
  private quantity: number;
  private createdAt: Date;
  private updatedAt: Date;

  constructor(
    resourceID: string,
    name: string,
    category: string,
    quantity: number,
    createdAt: Date,
    updatedAt: Date,
  ) {
    super();
    this.resourceID = resourceID;
    this.name = name;
    this.category = category;
    this.quantity = quantity;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
  }

  public getResourceID(): string {
    return this.resourceID;
  }

  public getName(): string {
    return this.name;
  }

  public getCategory(): string {
    return this.category;
  }

  public getQuantity(): number {
    return this.quantity;
  }

  public getCreatedAt(): Date {
    return this.createdAt;
  }

  public getUpdatedAt(): Date {
    return this.updatedAt;
  }

  public update(name: string, category: string, quantity: number): void {
    this.name = name;
    this.category = category;
    this.quantity = quantity;
    this.updatedAt = new Date();
  }
}
