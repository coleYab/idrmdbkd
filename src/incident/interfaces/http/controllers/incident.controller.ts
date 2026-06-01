import {
  BadRequestException,
  Body,
  ClassSerializerInterceptor,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  NotFoundException,
  Param,
  Post,
  Put,
  Query,
  UseInterceptors,
} from '@nestjs/common';
import {
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { v4 as uuidv4 } from 'uuid';

import { AuditLogService } from '../../../../audit-log/services/audit-log.service';
import {
  BaseApiErrorResponse,
  BaseApiResponse,
  SwaggerBaseApiResponse,
} from '../../../../shared/dtos/base-api-response.dto';
import {
  IncidentSeverityLevel,
  IncidentStatus,
} from '../../../../shared/enums/incident.enums';
import { AppLogger } from '../../../../shared/logger/logger.service';
import { ReqContext } from '../../../../shared/request-context/req-context.decorator';
import { RequestContext } from '../../../../shared/request-context/request-context.dto';
import { ReportIncidentDto } from '../../../application/dto/create-incident.dto';
import {
  UpdateIncidentDto,
  UpdateIncidentStatus,
} from '../../../application/dto/update-incident.dto';
import { IncidentService } from '../../../application/services/incident.service';
import { CreateIncidentUseCase } from '../../../application/use-cases/create-module/create-incident.use-case';
import { UpdateIncidentUseCase } from '../../../application/use-cases/update/update-incident.use-case';
import { Incident } from '../../../domain/entities/incident.entity';

@ApiTags('incidents')
@Controller('incidents')
export class IncidentController {
  constructor(
    private readonly createIncidentUseCase: CreateIncidentUseCase,
    private readonly updateIncidentUseCase: UpdateIncidentUseCase,
    private readonly incidentService: IncidentService,
    private readonly auditLogService: AuditLogService,
    private readonly logger: AppLogger,
  ) {
    this.logger.setContext(IncidentController.name);
  }

  @UseInterceptors(ClassSerializerInterceptor)
  @Post()
  @ApiOperation({
    summary: 'Create incident API',
    description: 'Creates a new incident report.',
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    type: SwaggerBaseApiResponse(Incident),
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    type: BaseApiErrorResponse,
  })
  @ApiResponse({
    status: HttpStatus.INTERNAL_SERVER_ERROR,
    type: BaseApiErrorResponse,
  })
  @ApiBody({ type: ReportIncidentDto })
  async create(
    @ReqContext() ctx: RequestContext,
    @Body() dto: ReportIncidentDto,
  ): Promise<BaseApiResponse<Incident>> {
    this.logger.log(ctx, `${this.create.name} was called`);

    const incident = await this.createIncidentUseCase.execute(
      ctx.user?.id.toString() || uuidv4(),
      dto,
    );
    await this.auditLogService.create(
      'CREATE',
      'Incident',
      `Incident created: ${incident.getId()}`,
      ctx.user?.id || 0,
    );
    return { data: incident, meta: {} };
  }

  @UseInterceptors(ClassSerializerInterceptor)
  @Get(':id')
  @ApiOperation({
    summary: 'Get incident by id API',
    description: 'Fetches a single incident by its identifier.',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    type: SwaggerBaseApiResponse(Incident),
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    type: BaseApiErrorResponse,
  })
  @ApiResponse({
    status: HttpStatus.INTERNAL_SERVER_ERROR,
    type: BaseApiErrorResponse,
  })
  @ApiParam({
    name: 'id',
    description: 'Incident ID',
    type: String,
  })
  async findOne(
    @ReqContext() ctx: RequestContext,
    @Param('id') id: string,
  ): Promise<BaseApiResponse<Incident>> {
    this.logger.log(ctx, `${this.findOne.name} was called`);

    const incident = await this.incidentService.findOne(id);
    if (!incident) {
      throw new NotFoundException('Incident not found');
    }

    await this.auditLogService.create(
      'READ',
      'Incident',
      `Incident read: ${id}`,
      ctx.user?.id || 0,
    );

    return { data: incident, meta: {} };
  }

  @UseInterceptors(ClassSerializerInterceptor)
  @Get()
  @ApiOperation({
    summary: 'Get incidents list API',
    description: 'Fetches all incidents.',
  })
  @ApiQuery({
    name: 'status',
    required: false,
    description: 'Filter incidents by comma-separated status values',
  })
  @ApiQuery({
    name: 'severity',
    required: false,
    description: 'Filter incidents by comma-separated severity values',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    type: SwaggerBaseApiResponse([Incident]),
  })
  @ApiResponse({
    status: HttpStatus.INTERNAL_SERVER_ERROR,
    type: BaseApiErrorResponse,
  })
  async findAll(
    @ReqContext() ctx: RequestContext,
    @Query('status') status?: string,
    @Query('severity') severity?: string,
  ): Promise<BaseApiResponse<Incident[]>> {
    this.logger.log(ctx, `${this.findAll.name} was called`);

    const parsedStatuses = status
      ? status
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean)
      : undefined;
    const parsedSeverities = severity
      ? severity
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean)
      : undefined;

    // Validate enum values
    if (parsedStatuses) {
      const invalid = parsedStatuses.filter(
        (s) => !Object.values(IncidentStatus).includes(s as any),
      );
      if (invalid.length) {
        throw new BadRequestException(
          `Invalid status value(s): ${invalid.join(',')}`,
        );
      }
    }
    if (parsedSeverities) {
      const invalid = parsedSeverities.filter(
        (s) => !Object.values(IncidentSeverityLevel).includes(s as any),
      );
      if (invalid.length) {
        throw new BadRequestException(
          `Invalid severity value(s): ${invalid.join(',')}`,
        );
      }
    }

    const incidents =
      parsedStatuses || parsedSeverities
        ? await this.incidentService.findByFilters({
            statuses: parsedStatuses as unknown as IncidentStatus[] | undefined,
            severities: parsedSeverities as unknown as
              | IncidentSeverityLevel[]
              | undefined,
          })
        : await this.incidentService.findAll();

    await this.auditLogService.create(
      'READ',
      'Incident',
      'Incidents list read',
      ctx.user?.id || 0,
    );
    return { data: incidents, meta: {} };
  }

  @UseInterceptors(ClassSerializerInterceptor)
  @Put(':id')
  @ApiOperation({
    summary: 'Update incident API',
    description: 'Updates incident details (title and description).',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    type: SwaggerBaseApiResponse(Incident),
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    type: BaseApiErrorResponse,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    type: BaseApiErrorResponse,
  })
  @ApiResponse({
    status: HttpStatus.INTERNAL_SERVER_ERROR,
    type: BaseApiErrorResponse,
  })
  @ApiParam({
    name: 'id',
    description: 'Incident ID',
    type: String,
  })
  @ApiBody({ type: UpdateIncidentDto })
  async update(
    @ReqContext() ctx: RequestContext,
    @Param('id') id: string,
    @Body() dto: UpdateIncidentDto,
  ): Promise<BaseApiResponse<Incident>> {
    this.logger.log(ctx, `${this.update.name} was called`);

    const incident = await this.updateIncidentUseCase.execute(id, dto);
    await this.auditLogService.create(
      'UPDATE',
      'Incident',
      `Incident updated: ${id}`,
      ctx.user?.id || 0,
    );
    return { data: incident, meta: {} };
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Delete incident API',
    description: 'Deletes an incident by its identifier.',
  })
  @ApiResponse({
    status: HttpStatus.NO_CONTENT,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    type: BaseApiErrorResponse,
  })
  @ApiResponse({
    status: HttpStatus.INTERNAL_SERVER_ERROR,
    type: BaseApiErrorResponse,
  })
  @ApiParam({
    name: 'id',
    description: 'Incident ID',
    type: String,
  })
  async delete(
    @ReqContext() ctx: RequestContext,
    @Param('id') id: string,
  ): Promise<void> {
    this.logger.log(ctx, `${this.delete.name} was called`);
    await this.incidentService.delete(id);
    await this.auditLogService.create(
      'DELETE',
      'Incident',
      `Incident deleted: ${id}`,
      ctx.user?.id || 0,
    );
  }

  @Put(':id/resolve')
  @ApiOperation({
    summary: 'Resolve incident API',
    description:
      'Updates the incident status (e.g., resolves/verifies/rejects).',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    type: Incident,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    type: BaseApiErrorResponse,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    type: BaseApiErrorResponse,
  })
  @ApiResponse({
    status: HttpStatus.INTERNAL_SERVER_ERROR,
    type: BaseApiErrorResponse,
  })
  @ApiParam({
    name: 'id',
    description: 'Incident ID',
    type: String,
  })
  @ApiBody({ type: UpdateIncidentStatus })
  async resolve(
    @ReqContext() ctx: RequestContext,
    @Param('id') id: string,
    @Body() dto: UpdateIncidentStatus,
  ): Promise<Incident> {
    const incident = await this.incidentService.resolve(
      id,
      ctx.user?.id.toString() || uuidv4(),
      dto.status,
    );
    await this.auditLogService.create(
      'UPDATE',
      'Incident',
      `Incident resolved to ${dto.status}: ${id}`,
      ctx.user?.id || 0,
    );
    return incident;
  }
}
