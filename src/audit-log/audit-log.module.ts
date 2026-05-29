import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { SharedModule } from '../shared/shared.module';
import { AuditLogController } from './controllers/audit-log.controller';
import { AuditLog } from './entities/audit-log.entity';
import { AuditLogRepository } from './repositories/audit-log.repository';
import { AuditLogService } from './services/audit-log.service';

@Module({
  imports: [SharedModule, TypeOrmModule.forFeature([AuditLog])],
  providers: [AuditLogService, AuditLogRepository],
  controllers: [AuditLogController],
  exports: [AuditLogService],
})
export class AuditLogModule {}
