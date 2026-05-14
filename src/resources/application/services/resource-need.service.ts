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
import { CreateResourceNeedDto } from '../dto/create-resource-need.dto';

@Injectable()
export class ResourceNeedService {
  constructor(
    @Inject(RESOURCE_NEED_REPOSITORY)
    private readonly resourceNeedRepository: ResourceNeedRepository,
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
}
