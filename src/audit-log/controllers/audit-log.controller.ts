import {
  ClassSerializerInterceptor,
  Controller,
  Get,
  HttpStatus,
  Query,
  UseInterceptors,
} from '@nestjs/common';
import {
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

import {
  BaseApiResponse,
  SwaggerBaseApiResponse,
} from '../../shared/dtos/base-api-response.dto';
import { AppLogger } from '../../shared/logger/logger.service';
import { ReqContext } from '../../shared/request-context/req-context.decorator';
import { RequestContext } from '../../shared/request-context/request-context.dto';
import { AuditLogOutput } from '../dtos/audit-log-output.dto';
import { AuditLogQueryDto } from '../dtos/audit-log-query.dto';
import { AuditLogService } from '../services/audit-log.service';

@ApiTags('audit-logs')
@Controller('audit-logs')
export class AuditLogController {
  constructor(
    private readonly auditLogService: AuditLogService,
    private readonly logger: AppLogger,
  ) {
    this.logger.setContext(AuditLogController.name);
  }

  @UseInterceptors(ClassSerializerInterceptor)
  @Get()
  @ApiOperation({
    summary: 'Get audit logs with filtering and pagination',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    type: SwaggerBaseApiResponse([AuditLogOutput]),
  })
  async getAuditLogs(
    @ReqContext() ctx: RequestContext,
    @Query() query: AuditLogQueryDto,
  ): Promise<BaseApiResponse<AuditLogOutput[]>> {
    this.logger.log(ctx, `${this.getAuditLogs.name} was called`);

    const { logs, count } = await this.auditLogService.findAll(ctx, query);

    return { data: logs, meta: { count } };
  }
}
