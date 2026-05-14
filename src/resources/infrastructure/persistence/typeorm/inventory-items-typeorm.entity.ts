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

  @Column({ type: 'varchar', length: 255 })
  location: string;

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
