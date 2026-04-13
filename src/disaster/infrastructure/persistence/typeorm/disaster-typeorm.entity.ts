import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

import { CommentTypeOrmEntity } from '../../../../comment/infrastructure/persistence/typeorm/comment-typeorm.entity';
import {
  DisasterSeverityLevel,
  DisasterStatus,
  DisasterType,
} from '../../../../shared/enums/disaster.enums';

@Entity('disasters')
export class DisasterTypeOrmEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  title: string;

  @Column({ type: 'text' })
  description: string;

  @Column({
    type: 'enum',
    enum: DisasterType,
  })
  type: DisasterType;

  @Column({
    type: 'enum',
    enum: DisasterStatus,
  })
  status: DisasterStatus;

  @Column({
    type: 'enum',
    enum: DisasterSeverityLevel,
  })
  severity: DisasterSeverityLevel;

  @Column()
  location: string;

  @Column({ type: 'int' })
  totalAffectedPopulation: number;

  @Column({ default: false })
  requiresUrgentMedical: boolean;

  @Column('text', { array: true, default: [] })
  infrastructureDamage: string[];

  @Column('text', { array: true, default: [] })
  attachments: string[];

  @Column({ type: 'float', default: 0 })
  estimatedEconomicLoss: number;

  @Column({ type: 'float', default: 0 })
  budgetAllocated: number;

  @Column()
  declaredBy: string;

  @Column('text', { array: true, default: [] })
  linkedIncidentIds: string[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  activatedAt?: Date;

  @Column({ type: 'timestamp', nullable: true })
  closedAt?: Date;

  @OneToMany(() => CommentTypeOrmEntity, (comment) => comment.disasterId)
  comments: CommentTypeOrmEntity[];
}
