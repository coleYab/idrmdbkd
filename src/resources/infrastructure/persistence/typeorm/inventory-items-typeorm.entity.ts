import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

import { ResourceTypeOrmEntity } from './resource-typeorm.entity';

@Entity('inventory_items')
export class InventoryItemsTypeOrmEntity {
  @PrimaryGeneratedColumn('uuid')
  itemID: string;

  @Column({ type: 'uuid' })
  resourceID: string;

  @Column({ type: 'int', default: 0 })
  quantity: number;

  // PostGIS Point stored in EPSG:4326
  @Column({
    type: 'geometry',
    spatialFeatureType: 'Point',
    srid: 4326,
    nullable: true,
  })
  location: any;

  @Column({ type: 'timestamp', nullable: true })
  lastRestocked?: Date;

  @ManyToOne(() => ResourceTypeOrmEntity, (resource) => resource.inventoryItems)
  @JoinColumn({ name: 'resourceID' })
  resource?: ResourceTypeOrmEntity;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
