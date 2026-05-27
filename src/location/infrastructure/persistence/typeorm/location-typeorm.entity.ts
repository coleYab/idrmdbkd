import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

import { IncidentTypeOrmEntity } from '../../../../incident/infrastructure/persistence/typeorm/incident-typeorm.entity';
import { ErtUnitTypeOrmEntity } from '../../../../ert/infrastructure/persistence/typeorm/ert-unit-typeorm.entity';

@Entity('locations')
export class LocationTypeOrmEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ type: 'text' })
  description: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(() => IncidentTypeOrmEntity, (incident) => incident.locationId, {
    cascade: false,
  })
  incidents?: IncidentTypeOrmEntity[];

  @OneToMany(() => ErtUnitTypeOrmEntity, (unit) => unit.locationId, {
    cascade: false,
  })
  ertUnits?: ErtUnitTypeOrmEntity[];
}
