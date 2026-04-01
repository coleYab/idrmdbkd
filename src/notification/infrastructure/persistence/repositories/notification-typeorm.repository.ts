import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Notification } from '../../../domain/entities/notification.entity';
import { NotificationRepository } from '../../../domain/repositories/notification.repository';
import { NotificationTypeOrmEntity } from '../typeorm/notification-typeorm.entity';

@Injectable()
export class NotificationTypeOrmRepository implements NotificationRepository {
  constructor(
    @InjectRepository(NotificationTypeOrmEntity)
    private readonly repository: Repository<NotificationTypeOrmEntity>,
  ) {}

  async findById(id: string): Promise<Notification | null> {
    const entity = await this.repository.findOne({ where: { id } });
    if (!entity) return null;

    return new Notification(
      entity.id,
      entity.title,
      entity.message,
      entity.recipient,
      entity.type,
      entity.status,
      entity.createdAt,
      entity.updatedAt,
    );
  }

  async findAll(): Promise<Notification[]> {
    const entities = await this.repository.find();
    return entities.map(
      (entity) =>
        new Notification(
          entity.id,
          entity.title,
          entity.message,
          entity.recipient,
          entity.type,
          entity.status,
          entity.createdAt,
          entity.updatedAt,
        ),
    );
  }

  async findByRecipient(recipient: string): Promise<Notification[]> {
    const entities = await this.repository.find({ where: { recipient } });
    return entities.map(
      (entity) =>
        new Notification(
          entity.id,
          entity.title,
          entity.message,
          entity.recipient,
          entity.type,
          entity.status,
          entity.createdAt,
          entity.updatedAt,
        ),
    );
  }

  async save(notification: Notification): Promise<void> {
    const entity = new NotificationTypeOrmEntity();
    entity.id = notification.getId();
    entity.title = notification.getTitle();
    entity.message = notification.getMessage();
    entity.recipient = notification.getRecipient();
    entity.type = notification.getType();
    entity.status = notification.getStatus();
    entity.createdAt = notification.getCreatedAt();
    entity.updatedAt = notification.getUpdatedAt();
    await this.repository.save(entity);
  }

  async update(notification: Notification): Promise<void> {
    const entity = await this.repository.findOne({
      where: { id: notification.getId() },
    });
    if (!entity) throw new Error('Notification not found');
    entity.id = notification.getId();
    entity.title = notification.getTitle();
    entity.message = notification.getMessage();
    entity.recipient = notification.getRecipient();
    entity.type = notification.getType();
    entity.status = notification.getStatus();
    entity.createdAt = notification.getCreatedAt();
    entity.updatedAt = notification.getUpdatedAt();
    await this.repository.save(entity);
  }

  async delete(id: string): Promise<void> {
    await this.repository.delete(id);
  }
}
