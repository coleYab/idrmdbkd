import { InventoryItems } from '../../domain/entities/inventory-items.entity';

export const INVENTORY_ITEMS_REPOSITORY = Symbol.for(
  'InventoryItemsRepository',
);

export interface InventoryItemsRepository {
  findById(id: string): Promise<InventoryItems | null>;
  findAll(): Promise<InventoryItems[]>;
  findByResourceId(resourceID: string): Promise<InventoryItems[]>;
  findByLocation(
    location: string,
    radiusMeters?: number,
  ): Promise<InventoryItems[]>;
  findNearby(
    resourceID: string,
    latitude: number,
    longitude: number,
    radiusMeters: number,
  ): Promise<InventoryItems[]>;
  save(item: InventoryItems): Promise<void>;
  update(item: InventoryItems): Promise<void>;
  delete(id: string): Promise<void>;
}
