import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

import { ErtUnitTypeOrmEntity } from '../../../../ert/infrastructure/persistence/typeorm/ert-unit-typeorm.entity';

@Entity('modules')
export class ModuleTypeOrmEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 100 })
  name: string;

  @Column({ length: 500 })
  description: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(() => ErtUnitTypeOrmEntity, (unit) => unit.moduleId, {
    cascade: false,
  })
  units?: ErtUnitTypeOrmEntity[];
}
