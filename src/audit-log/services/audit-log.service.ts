import { Injectable } from '@nestjs/common';
import { plainToClass } from 'class-transformer';
import { Between,FindManyOptions, Like } from 'typeorm';

import { AppLogger } from '../../shared/logger/logger.service';
import { RequestContext } from '../../shared/request-context/request-context.dto';
import { AuditLogOutput } from '../dtos/audit-log-output.dto';
import { AuditLogQueryDto } from '../dtos/audit-log-query.dto';
import { AuditLog } from '../entities/audit-log.entity';
import { AuditLogRepository } from '../repositories/audit-log.repository';

@Injectable()
export class AuditLogService {
  constructor(
    private repository: AuditLogRepository,
    private readonly logger: AppLogger,
  ) {
    this.logger.setContext(AuditLogService.name);
  }

  async create(
    actionType: string,
    resourceName: string,
    details: string,
    performedBy: number,
  ): Promise<AuditLogOutput> {
    const log = this.repository.create({
      actionType,
      resourceName,
      details,
      performedBy,
    });

    await this.repository.save(log);

    return plainToClass(AuditLogOutput, log, {
      excludeExtraneousValues: true,
    });
  }

  async findAll(
    ctx: RequestContext,
    query: AuditLogQueryDto,
  ): Promise<{ logs: AuditLogOutput[]; count: number }> {
    this.logger.log(ctx, `${this.findAll.name} was called`);

    const where: any = {};

    if (query.actionType) {
      where.actionType = query.actionType;
    }

    if (query.resourceName) {
      where.resourceName = query.resourceName;
    }

    if (query.performedBy) {
      where.performedBy = query.performedBy;
    }

    if (query.dateFrom && query.dateTo) {
      where.timestamp = Between(new Date(query.dateFrom), new Date(query.dateTo));
    } else if (query.dateFrom) {
      where.timestamp = Between(new Date(query.dateFrom), new Date());
    } else if (query.dateTo) {
      where.timestamp = Between(new Date(0), new Date(query.dateTo));
    }

    if (query.search) {
      where.details = Like(`%${query.search}%`);
    }

    const allowedSortFields = ['timestamp', 'actionType', 'resourceName', 'performedBy'] as const;
    const sortBy = (allowedSortFields.includes(query.sortBy as any) ? query.sortBy : 'timestamp') as string;
    const sortOrder = query.sortOrder === 'ASC' ? 'ASC' : 'DESC';

    const [logs, count] = await this.repository.findAndCount({
      where,
      order: { [sortBy]: sortOrder } as any,
      take: query.limit,
      skip: query.offset,
    });

    const logsOutput = plainToClass(AuditLogOutput, logs, {
      excludeExtraneousValues: true,
    });

    return { logs: logsOutput, count };
  }
}
