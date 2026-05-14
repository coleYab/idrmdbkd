import { BadRequestException,Inject, Injectable } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';

import { InventoryItems } from '../../domain/entities/inventory-items.entity';
import {
  INVENTORY_ITEMS_REPOSITORY,
  InventoryItemsRepository,
} from '../../domain/repositories/inventory-items.repository';
import { CreateInventoryItemDto } from '../dto/create-inventory-item.dto';

@Injectable()
export class InventoryItemsService {
  constructor(
    @Inject(INVENTORY_ITEMS_REPOSITORY)
    private readonly inventoryRepository: InventoryItemsRepository,
  ) {}

  public async create(dto: CreateInventoryItemDto): Promise<InventoryItems> {
    const item = new InventoryItems(
      uuidv4(),
      dto.resourceID,
      dto.quantity,
      dto.location,
      new Date(),
      new Date(),
    );
    await this.inventoryRepository.save(item);
    return item;
  }

  public async findAll(): Promise<InventoryItems[]> {
    return this.inventoryRepository.findAll();
  }

  public async findOne(id: string): Promise<InventoryItems | null> {
    return this.inventoryRepository.findById(id);
  }

  public async findByResourceId(resourceID: string): Promise<InventoryItems[]> {
    return this.inventoryRepository.findByResourceId(resourceID);
  }

  public async findByLocation(location: string): Promise<InventoryItems[]> {
    return this.inventoryRepository.findByLocation(location);
  }

  public async updateStock(
    id: string,
    quantity: number,
  ): Promise<InventoryItems> {
    const item = await this.inventoryRepository.findById(id);
    if (!item) {
      throw new Error('Inventory item not found');
    }

    if (quantity < 0) {
      throw new BadRequestException('Quantity cannot be negative');
    }

    item.updateQuantity(quantity);
    await this.inventoryRepository.update(item);
    return item;
  }

  public async addStock(id: string, amount: number): Promise<InventoryItems> {
    const item = await this.inventoryRepository.findById(id);
    if (!item) {
      throw new Error('Inventory item not found');
    }

    if (amount < 0) {
      throw new BadRequestException('Amount must be positive');
    }

    item.addQuantity(amount);
    await this.inventoryRepository.update(item);
    return item;
  }

  public async removeStock(
    id: string,
    amount: number,
  ): Promise<InventoryItems> {
    const item = await this.inventoryRepository.findById(id);
    if (!item) {
      throw new Error('Inventory item not found');
    }

    if (amount < 0) {
      throw new BadRequestException('Amount must be positive');
    }

    const success = item.removeQuantity(amount);
    if (!success) {
      throw new BadRequestException(
        `Insufficient stock. Available: ${item.getQuantity()}, Requested: ${amount}`,
      );
    }

    await this.inventoryRepository.update(item);
    return item;
  }

  public async checkAvailability(id: string, requiredQuantity: number) {
    const item = await this.inventoryRepository.findById(id);
    if (!item) {
      throw new Error('Inventory item not found');
    }

    const canFulfill = item.isAvailable(requiredQuantity);
    return {
      available: item.getQuantity(),
      required: requiredQuantity,
      canFulfill,
    };
  }

  public async delete(id: string): Promise<void> {
    await this.inventoryRepository.delete(id);
  }
}
