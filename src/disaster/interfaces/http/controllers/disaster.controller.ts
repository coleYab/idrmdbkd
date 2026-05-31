import {
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
  UseInterceptors,
  Query,
  BadRequestException,
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
import { AppLogger } from '../../../../shared/logger/logger.service';
import { ReqContext } from '../../../../shared/request-context/req-context.decorator';
import { RequestContext } from '../../../../shared/request-context/request-context.dto';
import { CreateDisasterDto } from '../../../application/dto/create-disaster.dto';
import { UpdateDisasterDto } from '../../../application/dto/update-disaster.dto';
import { DisasterService } from '../../../application/services/disaster.service';
import { CreateDisasterUseCase } from '../../../application/use-cases/create/create-disaster.use-case';
import { CreateDisasterFromIncidentUseCase } from '../../../application/use-cases/create/create-disaster-from-incident.use-case';
import { UpdateDisasterUseCase } from '../../../application/use-cases/update/update-disaster.use-case';
import { Disaster } from '../../../domain/entities/disaster.entity';
import { DisasterStatus, DisasterSeverityLevel } from '../../../../shared/enums/disaster.enums';


@ApiTags('disasters')
@Controller('disasters')
export class DisasterController {
  constructor(
    private readonly createDisasterUseCase: CreateDisasterUseCase,
    private readonly createDisasterFromIncidentUseCase: CreateDisasterFromIncidentUseCase,
    private readonly updateDisasterUseCase: UpdateDisasterUseCase,
    private readonly disasterService: DisasterService,
    private readonly auditLogService: AuditLogService,
    private readonly logger: AppLogger,
  ) {
    this.logger.setContext(DisasterController.name);
  }

  @UseInterceptors(ClassSerializerInterceptor)
  @Post()
  @ApiOperation({
    summary: 'Create disaster API',
  })
  @ApiBody({ type: CreateDisasterDto })
  @ApiResponse({
    status: HttpStatus.CREATED,
    type: SwaggerBaseApiResponse(Disaster),
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    type: BaseApiErrorResponse,
  })
  async create(
    @ReqContext() ctx: RequestContext,
    @Body() dto: CreateDisasterDto,
  ): Promise<BaseApiResponse<Disaster>> {
    this.logger.log(ctx, `${this.create.name} was called`);

    const disaster = await this.createDisasterUseCase.execute(
      ctx.user?.id.toString() || uuidv4(),
      dto,
    );
    await this.auditLogService.create(
      'CREATE',
      'Disaster',
      `Disaster created: ${disaster.getId()}`,
      ctx.user?.id || 0,
    );
    return { data: disaster, meta: {} };
  }

  @UseInterceptors(ClassSerializerInterceptor)
  @Get(':id')
  @ApiOperation({
    summary: 'Get disaster by id API',
  })
  @ApiParam({ name: 'id', type: String })
  @ApiResponse({
    status: HttpStatus.OK,
    type: SwaggerBaseApiResponse(Disaster),
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    type: BaseApiErrorResponse,
  })
  async findOne(
    @ReqContext() ctx: RequestContext,
    @Param('id') id: string,
  ): Promise<BaseApiResponse<Disaster>> {
    this.logger.log(ctx, `${this.findOne.name} was called`);

    const disaster = await this.disasterService.findOne(id);
    if (!disaster) {
      throw new NotFoundException('Disaster not found');
    }

    await this.auditLogService.create(
      'READ',
      'Disaster',
      `Disaster read: ${id}`,
      ctx.user?.id || 0,
    );

    return { data: disaster, meta: {} };
  }

  @UseInterceptors(ClassSerializerInterceptor)
  @Get()
  @ApiOperation({
    summary: 'Get incidents list API',
  })
  @ApiQuery({ name: 'status', required: false, description: 'Filter disasters by comma-separated status values' })
  @ApiQuery({ name: 'severity', required: false, description: 'Filter disasters by comma-separated severity values' })
  @ApiResponse({
    status: HttpStatus.OK,
    type: SwaggerBaseApiResponse([Disaster]),
  })
  async findAll(
    @ReqContext() ctx: RequestContext,
    @Query('status') status?: string,
    @Query('severity') severity?: string,
  ): Promise<BaseApiResponse<Disaster[]>> {
    this.logger.log(ctx, `${this.findAll.name} was called`);

    const parsedStatuses = status
      ? status.split(',').map((s) => s.trim()).filter(Boolean)
      : undefined;
    const parsedSeverities = severity
      ? severity.split(',').map((s) => s.trim()).filter(Boolean)
      : undefined;

    if (parsedStatuses) {
      const invalid = parsedStatuses.filter((s) => !Object.values(DisasterStatus).includes(s as any));
      if (invalid.length) throw new BadRequestException(`Invalid status value(s): ${invalid.join(',')}`);
    }
    if (parsedSeverities) {
      const invalid = parsedSeverities.filter((s) => !Object.values(DisasterSeverityLevel).includes(s as any));
      if (invalid.length) throw new BadRequestException(`Invalid severity value(s): ${invalid.join(',')}`);
    }

    const disasters = parsedStatuses || parsedSeverities
      ? await this.disasterService.findByFilters({ statuses: (parsedStatuses as unknown) as any[], severities: (parsedSeverities as unknown) as any[] })
      : await this.disasterService.findAll();

    await this.auditLogService.create('READ', 'Disaster', 'Disasters list read', ctx.user?.id || 0);
    return { data: disasters, meta: {} };
  }

  @UseInterceptors(ClassSerializerInterceptor)
  @Put(':id')
  @ApiOperation({
    summary: 'Update disaster API',
  })
  @ApiParam({ name: 'id', type: String })
  @ApiBody({ type: UpdateDisasterDto })
  @ApiResponse({
    status: HttpStatus.OK,
    type: SwaggerBaseApiResponse(Disaster),
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    type: BaseApiErrorResponse,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    type: BaseApiErrorResponse,
  })
  async update(
    @ReqContext() ctx: RequestContext,
    @Param('id') id: string,
    @Body() dto: UpdateDisasterDto,
  ): Promise<BaseApiResponse<Disaster>> {
    this.logger.log(ctx, `${this.update.name} was called`);

    const disaster = await this.updateDisasterUseCase.execute(id, dto);
    await this.auditLogService.create(
      'UPDATE',
      'Disaster',
      `Disaster updated: ${id}`,
      ctx.user?.id || 0,
    );
    return { data: disaster, meta: {} };
  }

  @UseInterceptors(ClassSerializerInterceptor)
  @Post('from/:id')
  @ApiOperation({
    summary: 'Create disaster from incident API',
  })
  @ApiParam({ name: 'id', type: String })
  @ApiResponse({
    status: HttpStatus.CREATED,
    type: SwaggerBaseApiResponse(Disaster),
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    type: BaseApiErrorResponse,
  })
  async createFromIncident(
    @Param('id') id: string,
    @ReqContext() ctx: RequestContext,
  ): Promise<BaseApiResponse<Disaster>> {
    const userId = ctx.user?.id.toString() || uuidv4();
    const disaster = await this.createDisasterFromIncidentUseCase.execute(
      userId,
      id,
    );
    await this.auditLogService.create(
      'CREATE',
      'Disaster',
      `Disaster created from incident ${id}: ${disaster.getId()}`,
      ctx.user?.id || 0,
    );
    return { data: disaster, meta: {} };
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Delete disaster API',
  })
  @ApiParam({ name: 'id', type: String })
  @ApiResponse({
    status: HttpStatus.NO_CONTENT,
    type: BaseApiResponse<void>,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    type: BaseApiErrorResponse,
  })
  async delete(
    @ReqContext() ctx: RequestContext,
    @Param('id') id: string,
  ): Promise<BaseApiResponse<void>> {
    this.logger.log(ctx, `${this.delete.name} was called`);
    await this.disasterService.delete(id);
    await this.auditLogService.create(
      'DELETE',
      'Disaster',
      `Disaster deleted: ${id}`,
      ctx.user?.id || 0,
    );
    return { data: undefined, meta: {} };
  }
}
