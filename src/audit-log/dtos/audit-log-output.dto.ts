import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

export class AuditLogOutput {
  @Expose()
  @ApiProperty()
  logID: number;

  @Expose()
  @ApiProperty()
  actionType: string;

  @Expose()
  @ApiProperty()
  resourceName: string;

  @Expose()
  @ApiProperty()
  details: string;

  @Expose()
  @ApiProperty()
  performedBy: string | null;

  @Expose()
  @ApiProperty()
  timestamp: Date;
}
