import { AggregateRoot } from '@nestjs/cqrs';

export enum NotificationType {
  EMAIL = 'email',
  SMS = 'sms',
  PUSH = 'push',
  IN_APP = 'in_app',
}

export enum NotificationStatus {
  PENDING = 'pending',
  SENT = 'sent',
  FAILED = 'failed',
  READ = 'read',
}

export class Notification extends AggregateRoot {
  private id: string;
  private title: string;
  private message: string;
  private recipient: string;
  private type: NotificationType;
  private status: NotificationStatus;
  private createdAt: Date;
  private updatedAt: Date;

  constructor(
    id: string,
    title: string,
    message: string,
    recipient: string,
    type: NotificationType,
    status: NotificationStatus,
    createdAt: Date,
    updatedAt: Date,
  ) {
    super();
    this.id = id;
    this.title = title;
    this.message = message;
    this.recipient = recipient;
    this.type = type;
    this.status = status;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
  }

  public getId(): string {
    return this.id;
  }

  public getTitle(): string {
    return this.title;
  }

  public getMessage(): string {
    return this.message;
  }

  public getRecipient(): string {
    return this.recipient;
  }

  public getType(): NotificationType {
    return this.type;
  }

  public getStatus(): NotificationStatus {
    return this.status;
  }

  public getCreatedAt(): Date {
    return this.createdAt;
  }

  public getUpdatedAt(): Date {
    return this.updatedAt;
  }

  public update(
    title: string,
    message: string,
    status: NotificationStatus,
  ): void {
    this.title = title;
    this.message = message;
    this.status = status;
    this.updatedAt = new Date();
  }

  public markAsRead(): void {
    this.status = NotificationStatus.READ;
    this.updatedAt = new Date();
  }

  public static create(
    id: string,
    title: string,
    message: string,
    recipient: string,
    type: NotificationType,
    status: NotificationStatus,
    createdAt: Date,
    updatedAt: Date,
  ): Notification {
    const notification = new Notification(
      id,
      title,
      message,
      recipient,
      type,
      status,
      createdAt,
      updatedAt,
    );
    return notification;
  }
}
