import { Module } from '@nestjs/common';

import { AuditLogModule } from '../audit-log/audit-log.module';
import { UploadController } from './upload.controller';
import { UploadService } from './upload.service';

@Module({
  imports: [AuditLogModule],
  controllers: [UploadController],
  providers: [UploadService],
})
export class UploadModule {}
