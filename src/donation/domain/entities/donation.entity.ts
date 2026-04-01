import { AggregateRoot } from '@nestjs/cqrs';

export class Donation extends AggregateRoot {
  private id: string;
  private title: string;
  private description: string;
  private createdAt: Date;
  private updatedAt: Date;

  constructor(
    id: string,
    title: string,
    description: string,
    createdAt: Date,
    updatedAt: Date,
  ) {
    super();
    this.id = id;
    this.title = title;
    this.description = description;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
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

  public update(title: string, description: string): void {
    this.title = title;
    this.description = description;
    this.updatedAt = new Date();
  }

  public static create(
    id: string,
    title: string,
    description: string,
    createdAt: Date,
    updatedAt: Date,
  ): Donation {
    const incident = new Donation(id, title, description, createdAt, updatedAt);
    return incident;
  }
}
