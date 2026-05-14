import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { ResourceTypeOrmEntity } from './resource-typeorm.entity';

export enum ResourceNeedPriorityEnum {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
}

export enum ResourceNeedStatusEnum {
  PENDING = 'pending',
  IN_PROGRESS = 'in_progress',
  SATISFIED = 'satisfied',
}

@Entity('resource_needs')
export class ResourceNeedTypeOrmEntity {
  @PrimaryGeneratedColumn('uuid')
  needID: string;

  @Column({ type: 'uuid' })
  resourceID: string;

  @Column({ type: 'int' })
  quantityRequired: number;

  @Column({ type: 'int', default: 0 })
  fulfilledQuantity: number;

  @Column({
    type: 'enum',
    enum: ResourceNeedPriorityEnum,
    default: ResourceNeedPriorityEnum.MEDIUM,
  })
  priority: ResourceNeedPriorityEnum;

  @Column({
    type: 'enum',
    enum: ResourceNeedStatusEnum,
    default: ResourceNeedStatusEnum.PENDING,
  })
  status: ResourceNeedStatusEnum;

  @Column({ type: 'uuid', nullable: true })
  incidentID?: string;

  @ManyToOne(() => ResourceTypeOrmEntity, (resource) => resource.needs)
  @JoinColumn({ name: 'resourceID' })
  resource?: ResourceTypeOrmEntity;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
