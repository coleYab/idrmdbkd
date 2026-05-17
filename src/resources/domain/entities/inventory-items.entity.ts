import { AggregateRoot } from '@nestjs/cqrs';

export class InventoryItems extends AggregateRoot {
  private itemID: string;
  private resourceID: string;
  private quantity: number;
  // GeoJSON Point: { type: 'Point', coordinates: [lon, lat] }
  private location: any;
  private lastRestocked?: Date;
  private createdAt: Date;
  private updatedAt: Date;

  constructor(
    itemID: string,
    resourceID: string,
    quantity: number,
    location: any,
    createdAt: Date,
    updatedAt: Date,
    lastRestocked?: Date,
  ) {
    super();
    this.itemID = itemID;
    this.resourceID = resourceID;
    this.quantity = quantity;
    this.location = location;
    this.lastRestocked = lastRestocked;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
  }

  public getItemID(): string {
    return this.itemID;
  }

  public getResourceID(): string {
    return this.resourceID;
  }

  public getQuantity(): number {
    return this.quantity;
  }

  public getLocation(): any {
    return this.location;
  }

  public getLastRestocked(): Date | undefined {
    return this.lastRestocked;
  }

  public getCreatedAt(): Date {
    return this.createdAt;
  }

  public getUpdatedAt(): Date {
    return this.updatedAt;
  }

  public updateQuantity(newQuantity: number): void {
    if (newQuantity < 0) {
      throw new Error('Quantity cannot be negative');
    }
    this.quantity = newQuantity;
    this.updatedAt = new Date();
  }

  public addQuantity(amount: number): void {
    if (amount < 0) {
      throw new Error('Amount must be positive');
    }
    this.quantity += amount;
    this.lastRestocked = new Date();
    this.updatedAt = new Date();
  }

  public removeQuantity(amount: number): boolean {
    if (amount < 0) {
      throw new Error('Amount must be positive');
    }
    if (this.quantity < amount) {
      return false;
    }
    this.quantity -= amount;
    this.updatedAt = new Date();
    return true;
  }

  public isAvailable(requiredQuantity: number): boolean {
    return this.quantity >= requiredQuantity;
  }

  public getAvailability(): {
    available: number;
    required: number;
    canFulfill: boolean;
  } {
    return {
      available: this.quantity,
      required: 0,
      canFulfill: true,
    };
  }
}
