import { ResourceNeed } from '../../domain/entities/resource-need.entity';

export const RESOURCE_NEED_REPOSITORY = Symbol.for('ResourceNeedRepository');

export interface ResourceNeedRepository {
  findById(id: string): Promise<ResourceNeed | null>;
  findAll(): Promise<ResourceNeed[]>;
  findByStatus(status: string): Promise<ResourceNeed[]>;
  findByPriority(priority: string): Promise<ResourceNeed[]>;
  findByResourceId(resourceID: string): Promise<ResourceNeed[]>;
  save(need: ResourceNeed): Promise<void>;
  update(need: ResourceNeed): Promise<void>;
  delete(id: string): Promise<void>;
}
