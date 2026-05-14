import { Resource } from '../entities/resource.entity';

export const RESOURCE_REPOSITORY = Symbol.for('ResourceRepository');
export interface ResourceRepository {
  findById(id: string): Promise<Resource | null>;
  findAll(): Promise<Resource[]>;
  findByCategory(category: string): Promise<Resource[]>;
  findByName(name: string): Promise<Resource[]>;
  save(resource: Resource): Promise<void>;
  update(resource: Resource): Promise<void>;
  delete(id: string): Promise<void>;
}
