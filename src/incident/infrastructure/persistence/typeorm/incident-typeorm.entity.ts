import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

import {
  IncidentSeverityLevel,
  IncidentStatus,
  IncidentType,
} from '../../../../shared/enums/incident.enums';

@Entity('incidents')
export class IncidentTypeOrmEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 100 })
  title: string;

  @Column({ length: 2000 })
  description: string;

  @Column({
    type: 'enum',
    enum: IncidentType,
    default: IncidentType.LANDSLIDE,
  })
  incidentType: IncidentType;

  @Column({
    type: 'enum',
    enum: IncidentStatus,
    default: IncidentStatus.ACTIVE,
  })
  status: IncidentStatus;
  @Column({
    type: 'enum',
    enum: IncidentSeverityLevel,
    default: IncidentSeverityLevel.LOW,
  })
  severity: IncidentSeverityLevel;

  @Column({ length: 200 })
  location: string;

  @Column('json')
  attachments: string[];

  @Column({ type: 'int' })
  affectedPopulationCount: number;

  @Column({ type: 'boolean', default: false })
  requiresUrgentMedical: boolean;

  @Column('json')
  infrastructureDamage: string[];

  @Column({ length: 100, nullable: true })
  resolvedBy?: string;

  @Column({ type: 'timestamp', nullable: true })
  resolvedAt?: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
