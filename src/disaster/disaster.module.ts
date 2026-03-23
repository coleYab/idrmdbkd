import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { SharedModule } from '../shared/shared.module';
import { DisasterService } from './application/services/disaster.service';
import { CreateDisasterUseCase } from './application/use-cases/create/create-disaster.use-case';
import { UpdateDisasterUseCase } from './application/use-cases/update/update-disaster.use-case';
import { DISASTER_REPOSITORY } from './domain/repositories/disaster.repository';
import { DisasterTypeOrmRepository } from './infrastructure/persistence/repositories/disaster-typeorm.repository';
import { DisasterTypeOrmEntity } from './infrastructure/persistence/typeorm/disaster-typeorm.entity';
import { DisasterController } from './interfaces/http/controllers/disaster.controller';

@Module({
  imports: [SharedModule, TypeOrmModule.forFeature([DisasterTypeOrmEntity])],
  controllers: [DisasterController],
  providers: [
    CreateDisasterUseCase,
    DisasterService,
    UpdateDisasterUseCase,
    {
      provide: DISASTER_REPOSITORY,
      useClass: DisasterTypeOrmRepository,
    },
  ],
  exports: [DISASTER_REPOSITORY],
})
export class DisasterModule {}
