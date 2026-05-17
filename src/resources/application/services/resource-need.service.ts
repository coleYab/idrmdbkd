import { Inject, Injectable } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';

import {
  ResourceNeed,
  ResourceNeedStatus,
} from '../../domain/entities/resource-need.entity';
import {
  RESOURCE_NEED_REPOSITORY,
  ResourceNeedRepository,
} from '../../domain/repositories/resource-need.repository';
import {
  INVENTORY_ITEMS_REPOSITORY,
  InventoryItemsRepository,
} from '../../domain/repositories/inventory-items.repository';
import { CreateResourceNeedDto } from '../dto/create-resource-need.dto';

@Injectable()
export class ResourceNeedService {
  constructor(
    @Inject(RESOURCE_NEED_REPOSITORY)
    private readonly resourceNeedRepository: ResourceNeedRepository,
    @Inject(INVENTORY_ITEMS_REPOSITORY)
    private readonly inventoryRepository: InventoryItemsRepository,
  ) {}

  public async create(dto: CreateResourceNeedDto): Promise<ResourceNeed> {
    const need = new ResourceNeed(
      uuidv4(),
      dto.resourceID,
      dto.quantityRequired,
      0,
      dto.priority as any,
      ResourceNeedStatus.PENDING,
      new Date(),
      new Date(),
      dto.incidentID,
    );
    await this.resourceNeedRepository.save(need);
    return need;
  }

  public async findAll(): Promise<ResourceNeed[]> {
    return this.resourceNeedRepository.findAll();
  }

  public async findOne(id: string): Promise<ResourceNeed | null> {
    return this.resourceNeedRepository.findById(id);
  }

  public async findByStatus(status: string): Promise<ResourceNeed[]> {
    return this.resourceNeedRepository.findByStatus(status);
  }

  public async findByPriority(priority: string): Promise<ResourceNeed[]> {
    return this.resourceNeedRepository.findByPriority(priority);
  }

  public async findByResourceId(resourceID: string): Promise<ResourceNeed[]> {
    return this.resourceNeedRepository.findByResourceId(resourceID);
  }

  public async updateStatus(
    id: string,
    status: ResourceNeedStatus,
  ): Promise<ResourceNeed> {
    const need = await this.resourceNeedRepository.findById(id);
    if (!need) {
      throw new Error('Resource need not found');
    }
    need.updateStatus(status);
    await this.resourceNeedRepository.update(need);
    return need;
  }

  public async approve(id: string): Promise<ResourceNeed> {
    const need = await this.resourceNeedRepository.findById(id);
    if (!need) {
      throw new Error('Resource need not found');
    }
    need.approve();
    await this.resourceNeedRepository.update(need);
    return need;
  }

  public async updateFulfillment(
    id: string,
    fulfilledQuantity: number,
  ): Promise<ResourceNeed> {
    const need = await this.resourceNeedRepository.findById(id);
    if (!need) {
      throw new Error('Resource need not found');
    }
    need.updateFulfilledQuantity(fulfilledQuantity);
    await this.resourceNeedRepository.update(need);
    return need;
  }

  public async getFulfillmentProgress(id: string) {
    const need = await this.resourceNeedRepository.findById(id);
    if (!need) {
      throw new Error('Resource need not found');
    }
    return need.getFulfillmentProgress();
  }

  public async delete(id: string): Promise<void> {
    await this.resourceNeedRepository.delete(id);
  }

  /**
   * Allocate supplies to a need by finding nearby inventory items (nearest first)
   * Accepts a center point (latitude, longitude) and radius in kilometers.
   */
  public async allocate(
    id: string,
    latitude: number,
    longitude: number,
    radiusKm = 50,
  ) {
    const need = await this.resourceNeedRepository.findById(id);
    if (!need) throw new Error('Resource need not found');

    const remaining = need.getQuantityRequired() - need.getFulfilledQuantity();
    if (remaining <= 0) return { allocated: [], remaining: 0 };

    const radiusMeters = Math.round(radiusKm * 1000);
    const candidates = await this.inventoryRepository.findNearby(
      need.getResourceID(),
      latitude,
      longitude,
      radiusMeters,
    );

    const plan: Array<any> = [];
    let toAllocate = remaining;
    for (const item of candidates) {
      if (toAllocate <= 0) break;
      const available = item.getQuantity();
      if (available <= 0) continue;
      const allocate = Math.min(available, toAllocate);
      plan.push({
        itemID: item.getItemID(),
        available,
        allocate,
        location: item.getLocation(),
      });
      toAllocate -= allocate;
    }

    return { allocated: plan, remaining: toAllocate };
  }
}
