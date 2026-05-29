import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsDateString, IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class AuditLogQueryDto {
  @ApiPropertyOptional({ description: 'Filter by action type (e.g. CREATE, UPDATE, DELETE)' })
  @IsString()
  @IsOptional()
  actionType?: string;

  @ApiPropertyOptional({ description: 'Filter by resource name' })
  @IsString()
  @IsOptional()
  resourceName?: string;

  @ApiPropertyOptional({ description: 'Filter by user ID who performed the action' })
  @IsNumber()
  @IsOptional()
  @Min(1)
  @Transform(({ value }) => parseInt(value, 10), { toClassOnly: true })
  performedBy?: number;

  @ApiPropertyOptional({ description: 'Start date for filtering (ISO 8601)' })
  @IsDateString()
  @IsOptional()
  dateFrom?: string;

  @ApiPropertyOptional({ description: 'End date for filtering (ISO 8601)' })
  @IsDateString()
  @IsOptional()
  dateTo?: string;

  @ApiPropertyOptional({ description: 'Search term within details' })
  @IsString()
  @IsOptional()
  search?: string;

  @ApiPropertyOptional({ description: 'Field to sort by', default: 'timestamp' })
  @IsString()
  @IsOptional()
  sortBy?: string;

  @ApiPropertyOptional({ description: 'Sort order', default: 'DESC' })
  @IsString()
  @IsOptional()
  sortOrder?: 'ASC' | 'DESC';

  @ApiPropertyOptional({ description: 'Records per page', default: 100 })
  @IsNumber()
  @IsOptional()
  @Min(1)
  @Transform(({ value }) => parseInt(value, 10), { toClassOnly: true })
  limit = 100;

  @ApiPropertyOptional({ description: 'Number of records to skip', default: 0 })
  @IsNumber()
  @IsOptional()
  @Min(0)
  @Transform(({ value }) => parseInt(value, 10), { toClassOnly: true })
  offset = 0;
}
