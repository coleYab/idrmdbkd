import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Like, Repository } from 'typeorm';

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
    let location = entity.location;
    // If location is returned as GeoJSON string, parse it
    try {
      if (typeof location === 'string') {
        const parsed = JSON.parse(location);
        location = parsed;
      }
    } catch (e) {
      // leave as-is
    }

    return new InventoryItems(
      entity.itemID,
      entity.resourceID,
      entity.quantity,
      location,
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
    // Expect location as "lat,lon" and optional radius via comma-sep "lat,lon,radiusMeters"
    const parts = location.split(',').map((p) => p.trim());
    if (parts.length >= 2) {
      const lat = parseFloat(parts[0]);
      const lon = parseFloat(parts[1]);
      const radius = parts.length >= 3 ? parseFloat(parts[2]) : 50000; // default 50km
      const rows = await this.repository.query(
        `SELECT itemid, resourceid, quantity, ST_AsGeoJSON(location) as location, lastrestocked, createdat, updatedat, ST_Distance(location::geography, ST_SetSRID(ST_MakePoint($1,$2),4326)::geography) as distance FROM inventory_items WHERE ST_DWithin(location::geography, ST_SetSRID(ST_MakePoint($1,$2),4326)::geography, $3) ORDER BY distance ASC`,
        [lon, lat, radius],
      );
      return rows.map(
        (r: any) =>
          new InventoryItems(
            r.itemid,
            r.resourceid,
            r.quantity,
            r.location ? JSON.parse(r.location) : null,
            r.createdat,
            r.updatedat,
            r.lastrestocked,
          ),
      );
    }

    // Fallback: return all
    const entities = await this.repository.find();
    return entities.map((entity) => this.toDomain(entity));
  }

  async findNearby(
    resourceID: string,
    latitude: number,
    longitude: number,
    radiusMeters: number,
  ): Promise<InventoryItems[]> {
    const rows = await this.repository.query(
      `SELECT itemid, resourceid, quantity, ST_AsGeoJSON(location) as location, lastrestocked, createdat, updatedat, ST_Distance(location::geography, ST_SetSRID(ST_MakePoint($1,$2),4326)::geography) as distance FROM inventory_items WHERE resourceid=$3 AND ST_DWithin(location::geography, ST_SetSRID(ST_MakePoint($1,$2),4326)::geography, $4) ORDER BY distance ASC`,
      [longitude, latitude, resourceID, radiusMeters],
    );

    return rows.map(
      (r: any) =>
        new InventoryItems(
          r.itemid,
          r.resourceid,
          r.quantity,
          r.location ? JSON.parse(r.location) : null,
          r.createdat,
          r.updatedat,
          r.lastrestocked,
        ),
    );
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
