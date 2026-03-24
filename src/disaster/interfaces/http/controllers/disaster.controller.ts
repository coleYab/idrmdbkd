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
import { v4 as uuidv4 } from 'uuid';

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

@ApiTags('disasters')
@Controller('disasters')
export class DisasterController {
  constructor(
    private readonly createDisasterUseCase: CreateDisasterUseCase,
    private readonly createDisasterFromIncidentUseCase: CreateDisasterFromIncidentUseCase,
    private readonly updateDisasterUseCase: UpdateDisasterUseCase,
    private readonly disasterService: DisasterService,
    private readonly logger: AppLogger,
  ) {
    this.logger.setContext(DisasterController.name);
  }

  @UseInterceptors(ClassSerializerInterceptor)
  @Post()
  @ApiOperation({
    summary: 'Create disaster API',
  })
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
      ctx.user?.id.toString() || uuidv4(), // Use user ID from context if available, otherwise generate a new UUID
      dto,
    );
    return { data: disaster, meta: {} };
  }

  @UseInterceptors(ClassSerializerInterceptor)
  @Get(':id')
  @ApiOperation({
    summary: 'Get disaster by id API',
  })
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

    return { data: disaster, meta: {} };
  }

  @UseInterceptors(ClassSerializerInterceptor)
  @Get()
  @ApiOperation({
    summary: 'Get incidents list API',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    type: SwaggerBaseApiResponse([Disaster]),
  })
  async findAll(
    @ReqContext() ctx: RequestContext,
  ): Promise<BaseApiResponse<Disaster[]>> {
    this.logger.log(ctx, `${this.findAll.name} was called`);

    const incidents = await this.disasterService.findAll();
    return { data: incidents, meta: {} };
  }

  @UseInterceptors(ClassSerializerInterceptor)
  @Put(':id')
  @ApiOperation({
    summary: 'Update disaster API',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    type: SwaggerBaseApiResponse(Disaster),
  })
  async update(
    @ReqContext() ctx: RequestContext,
    @Param('id') id: string,
    @Body() dto: UpdateDisasterDto,
  ): Promise<BaseApiResponse<Disaster>> {
    this.logger.log(ctx, `${this.update.name} was called`);

    const disaster = await this.updateDisasterUseCase.execute(id, dto);
    return { data: disaster, meta: {} };
  }

  @Post('from/:id')
  async createFromIncident(
    @Param('id') id: string,
    @Body() dto: CreateDisasterDto,
    @ReqContext() ctx: RequestContext,
  ): Promise<Disaster> {
    const userId = ctx.user?.id.toString() || uuidv4();
    return await this.createDisasterFromIncidentUseCase.execute(
      userId,
      dto,
      id,
    );
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Delete disaster API',
  })
  @ApiResponse({
    status: HttpStatus.NO_CONTENT,
  })
  async delete(
    @ReqContext() ctx: RequestContext,
    @Param('id') id: string,
  ): Promise<void> {
    this.logger.log(ctx, `${this.delete.name} was called`);
    await this.disasterService.delete(id);
  }
}
