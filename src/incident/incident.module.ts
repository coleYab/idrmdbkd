import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { SharedModule } from '../shared/shared.module';
import { IncidentService } from './application/services/incident.service';
import { CreateIncidentUseCase } from './application/use-cases/create-module/create-incident.use-case';
import { UpdateIncidentUseCase } from './application/use-cases/update/update-incident.use-case';
import { INCIDENT_REPOSITORY } from './domain/repositories/incident.repository';
import { IncidentTypeOrmRepository } from './infrastructure/persistence/repositories/incident-typeorm.repository';
import { IncidentTypeOrmEntity } from './infrastructure/persistence/typeorm/incident-typeorm.entity';
import { IncidentController } from './interfaces/http/controllers/incident.controller';

@Module({
  imports: [SharedModule, TypeOrmModule.forFeature([IncidentTypeOrmEntity])],
  controllers: [IncidentController],
  providers: [
    CreateIncidentUseCase,
    IncidentService,
    UpdateIncidentUseCase,
    {
      provide: INCIDENT_REPOSITORY,
      useClass: IncidentTypeOrmRepository,
    },
  ],
  exports: [INCIDENT_REPOSITORY],
})
export class IncidentModule {}
