import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';

import { AuditLog } from '../entities/audit-log.entity';

@Injectable()
export class AuditLogRepository extends Repository<AuditLog> {
  constructor(private dataSource: DataSource) {
    super(AuditLog, dataSource.createEntityManager());
  }
}
