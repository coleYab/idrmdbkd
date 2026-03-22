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
} from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

import {
  BaseApiErrorResponse,
  BaseApiResponse,
  SwaggerBaseApiResponse,
} from '../../../../shared/dtos/base-api-response.dto';
import { AppLogger } from '../../../../shared/logger/logger.service';
import { ReqContext } from '../../../../shared/request-context/req-context.decorator';
import { RequestContext } from '../../../../shared/request-context/request-context.dto';
import { ReportIncidentDto } from '../../../application/dto/create-incident.dto';
import { UpdateIncidentDto } from '../../../application/dto/update-incident.dto';
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
    private readonly logger: AppLogger,
  ) {
    this.logger.setContext(IncidentController.name);
  }

  @UseInterceptors(ClassSerializerInterceptor)
  @Post()
  @ApiOperation({
    summary: 'Create incident API',
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    type: SwaggerBaseApiResponse(Incident),
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    type: BaseApiErrorResponse,
  })
  async create(
    @ReqContext() ctx: RequestContext,
    @Body() dto: ReportIncidentDto,
  ): Promise<BaseApiResponse<Incident>> {
    this.logger.log(ctx, `${this.create.name} was called`);

    const incident = await this.createIncidentUseCase.execute(dto);
    return { data: incident, meta: {} };
  }

  @UseInterceptors(ClassSerializerInterceptor)
  @Get(':id')
  @ApiOperation({
    summary: 'Get incident by id API',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    type: SwaggerBaseApiResponse(Incident),
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    type: BaseApiErrorResponse,
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

    return { data: incident, meta: {} };
  }

  @UseInterceptors(ClassSerializerInterceptor)
  @Get()
  @ApiOperation({
    summary: 'Get incidents list API',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    type: SwaggerBaseApiResponse([Incident]),
  })
  async findAll(
    @ReqContext() ctx: RequestContext,
  ): Promise<BaseApiResponse<Incident[]>> {
    this.logger.log(ctx, `${this.findAll.name} was called`);

    const incidents = await this.incidentService.findAll();
    return { data: incidents, meta: {} };
  }

  @UseInterceptors(ClassSerializerInterceptor)
  @Put(':id')
  @ApiOperation({
    summary: 'Update incident API',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    type: SwaggerBaseApiResponse(Incident),
  })
  async update(
    @ReqContext() ctx: RequestContext,
    @Param('id') id: string,
    @Body() dto: UpdateIncidentDto,
  ): Promise<BaseApiResponse<Incident>> {
    this.logger.log(ctx, `${this.update.name} was called`);

    const incident = await this.updateIncidentUseCase.execute(id, dto);
    return { data: incident, meta: {} };
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Delete incident API',
  })
  @ApiResponse({
    status: HttpStatus.NO_CONTENT,
  })
  async delete(
    @ReqContext() ctx: RequestContext,
    @Param('id') id: string,
  ): Promise<void> {
    this.logger.log(ctx, `${this.delete.name} was called`);

    await this.incidentService.delete(id);
  }
}
