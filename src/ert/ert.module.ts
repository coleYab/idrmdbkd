import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AuditLogModule } from '../audit-log/audit-log.module';
import { SharedModule } from '../shared/shared.module';
import { ErtService } from './application/services/ert.service';
import { ERT_UNIT_REPOSITORY } from './domain/repositories/ert-unit.repository';
import { ErtUnitTypeOrmRepository } from './infrastructure/persistence/repositories/ert-unit-typeorm.repository';
import { ErtUnitTypeOrmEntity } from './infrastructure/persistence/typeorm/ert-unit-typeorm.entity';
import { ErtController } from './interfaces/http/controllers/ert.controller';
import { ErtMapController } from './interfaces/http/controllers/ert-map.controller';

@Module({
  imports: [SharedModule, AuditLogModule, TypeOrmModule.forFeature([ErtUnitTypeOrmEntity])],
  controllers: [ErtController, ErtMapController],
  providers: [
    ErtService,
    { provide: ERT_UNIT_REPOSITORY, useClass: ErtUnitTypeOrmRepository },
  ],
  exports: [ERT_UNIT_REPOSITORY],
})
export class ErtModule {}
