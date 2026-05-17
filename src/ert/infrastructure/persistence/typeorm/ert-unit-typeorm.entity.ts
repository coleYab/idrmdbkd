import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

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
}
