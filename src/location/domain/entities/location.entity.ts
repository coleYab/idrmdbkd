import { AggregateRoot } from '@nestjs/cqrs';

export class Location extends AggregateRoot {
  private id: string;
  private name: string;
  private description: string;
  private createdAt: Date;
  private updatedAt: Date;

  constructor(
    id: string,
    name: string,
    description: string,
    createdAt: Date,
    updatedAt: Date,
  ) {
    super();
    this.id = id;
    this.name = name;
    this.description = description;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
  }

  public getId(): string {
    return this.id;
  }

  public getName(): string {
    return this.name;
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

  public update(name: string, description: string): void {
    this.name = name;
    this.description = description;
    this.updatedAt = new Date();
  }

  public static create(
    id: string,
    name: string,
    description: string,
    createdAt: Date,
    updatedAt: Date,
  ): Location {
    const location = new Location(id, name, description, createdAt, updatedAt);
    return location;
  }
}
