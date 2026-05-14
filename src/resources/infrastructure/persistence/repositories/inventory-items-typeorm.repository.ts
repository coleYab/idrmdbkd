import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Like,Repository } from 'typeorm';

import { InventoryItems } from '../../../domain/entities/inventory-items.entity';
import { InventoryItemsRepository } from '../../../domain/repositories/inventory-items.repository';
import { InventoryItemsTypeOrmEntity } from '../typeorm/inventory-items-typeorm.entity';

@Injectable()
export class InventoryItemsTypeOrmRepository implements InventoryItemsRepository {
  constructor(
    @InjectRepository(InventoryItemsTypeOrmEntity)
    private readonly repository: Repository<InventoryItemsTypeOrmEntity>,
  ) {}

  private toDomain(entity: InventoryItemsTypeOrmEntity): InventoryItems {
    return new InventoryItems(
      entity.itemID,
      entity.resourceID,
      entity.quantity,
      entity.location,
      entity.createdAt,
      entity.updatedAt,
      entity.lastRestocked,
    );
  }

  async findById(id: string): Promise<InventoryItems | null> {
    const entity = await this.repository.findOne({ where: { itemID: id } });
    if (!entity) return null;
    return this.toDomain(entity);
  }

  async findAll(): Promise<InventoryItems[]> {
    const entities = await this.repository.find();
    return entities.map((entity) => this.toDomain(entity));
  }

  async findByResourceId(resourceID: string): Promise<InventoryItems[]> {
    const entities = await this.repository.find({ where: { resourceID } });
    return entities.map((entity) => this.toDomain(entity));
  }

  async findByLocation(location: string): Promise<InventoryItems[]> {
    const entities = await this.repository.find({
      where: { location: Like(`%${location}%`) },
    });
    return entities.map((entity) => this.toDomain(entity));
  }

  async save(item: InventoryItems): Promise<void> {
    const entity = new InventoryItemsTypeOrmEntity();
    entity.itemID = item.getItemID();
    entity.resourceID = item.getResourceID();
    entity.quantity = item.getQuantity();
    entity.location = item.getLocation();
    entity.lastRestocked = item.getLastRestocked();
    entity.createdAt = item.getCreatedAt();
    entity.updatedAt = item.getUpdatedAt();
    await this.repository.save(entity);
  }

  async update(item: InventoryItems): Promise<void> {
    const entity = await this.repository.findOne({
      where: { itemID: item.getItemID() },
    });
    if (!entity) throw new Error('Inventory item not found');
    entity.resourceID = item.getResourceID();
    entity.quantity = item.getQuantity();
    entity.location = item.getLocation();
    entity.lastRestocked = item.getLastRestocked();
    entity.updatedAt = item.getUpdatedAt();
    await this.repository.save(entity);
  }

  async delete(id: string): Promise<void> {
    await this.repository.delete({ itemID: id });
  }
}
