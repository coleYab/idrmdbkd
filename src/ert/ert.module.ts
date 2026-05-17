import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { SharedModule } from '../shared/shared.module';
import { ErtService } from './application/services/ert.service';
import { ErtController } from './interfaces/http/controllers/ert.controller';
import { ErtMapController } from './interfaces/http/controllers/ert-map.controller';
import { ERT_UNIT_REPOSITORY } from './domain/repositories/ert-unit.repository';
import { ErtUnitTypeOrmEntity } from './infrastructure/persistence/typeorm/ert-unit-typeorm.entity';
import { ErtUnitTypeOrmRepository } from './infrastructure/persistence/repositories/ert-unit-typeorm.repository';

@Module({
  imports: [SharedModule, TypeOrmModule.forFeature([ErtUnitTypeOrmEntity])],
  controllers: [ErtController, ErtMapController],
  providers: [
    ErtService,
    { provide: ERT_UNIT_REPOSITORY, useClass: ErtUnitTypeOrmRepository },
  ],
  exports: [ERT_UNIT_REPOSITORY],
})
export class ErtModule {}
