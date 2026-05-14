import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

import { InventoryItemsTypeOrmEntity } from './inventory-items-typeorm.entity';
import { ResourceNeedTypeOrmEntity } from './resource-need-typeorm.entity';

@Entity('resources')
export class ResourceTypeOrmEntity {
  @PrimaryGeneratedColumn('uuid')
  resourceID: string;

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'varchar', length: 100 })
  category: string;

  @Column({ type: 'int', default: 0 })
  quantity: number;

  @OneToMany(() => ResourceNeedTypeOrmEntity, (need) => need.resource, {
    cascade: true,
    onDelete: 'CASCADE',
  })
  needs?: ResourceNeedTypeOrmEntity[];

  @OneToMany(
    () => InventoryItemsTypeOrmEntity,
    (inventory) => inventory.resource,
    { cascade: true, onDelete: 'CASCADE' },
  )
  inventoryItems?: InventoryItemsTypeOrmEntity[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
