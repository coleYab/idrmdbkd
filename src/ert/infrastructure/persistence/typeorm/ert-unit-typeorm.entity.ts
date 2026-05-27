import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

import { ModuleTypeOrmEntity } from '../../../../module/infrastructure/persistence/typeorm/module-typeorm.entity';
import { LocationTypeOrmEntity } from '../../../../location/infrastructure/persistence/typeorm/location-typeorm.entity';
import { User } from '../../../../user/entities/user.entity';

@Entity('ert_units')
export class ErtUnitTypeOrmEntity {
  @PrimaryGeneratedColumn('uuid')
  unitID: string;

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'varchar', length: 50, default: 'idle' })
  status: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  region?: string;

  // PostGIS Point stored in EPSG:4326
  @Column({
    type: 'geometry',
    spatialFeatureType: 'Point',
    srid: 4326,
    nullable: true,
  })
  location?: any;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => ModuleTypeOrmEntity, (module) => module.units, {
    nullable: true,
  })
  @Column({ type: 'uuid', nullable: true })
  moduleId?: string;

  @ManyToOne(() => LocationTypeOrmEntity, { nullable: true })
  @Column({ type: 'uuid', nullable: true })
  locationId?: string;

  @ManyToOne(() => User, { nullable: true })
  @Column({ type: 'int', nullable: true })
  assignedToUserId?: number;
}
