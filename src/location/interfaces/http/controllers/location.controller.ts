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
import { CreateLocationDto } from '../../../application/dto/create-location.dto';
import { UpdateLocationDto } from '../../../application/dto/update-location.dto';
import { LocationService } from '../../../application/services/location.service';
import { CreateLocationUseCase } from '../../../application/use-cases/create/create-location.use-case';
import { CreateLocationCampaignUseCase } from '../../../application/use-cases/create/create-location-campaign.use-case';
import { UpdateLocationUseCase } from '../../../application/use-cases/update/update-location.use-case';
import { Location } from '../../../domain/entities/location.entity';

@ApiTags('locations')
@Controller('locations')
export class LocationController {
  constructor(
    private readonly createLocationUseCase: CreateLocationUseCase,
    private readonly createLocationCampaignUseCase: CreateLocationCampaignUseCase,
    private readonly updateLocationUseCase: UpdateLocationUseCase,
    private readonly locationService: LocationService,
    private readonly logger: AppLogger,
  ) {
    this.logger.setContext(LocationController.name);
  }

  @UseInterceptors(ClassSerializerInterceptor)
  @Post()
  @ApiOperation({
    summary: 'Create location API',
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    type: SwaggerBaseApiResponse(Location),
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    type: BaseApiErrorResponse,
  })
  async create(
    @ReqContext() ctx: RequestContext,
    @Body() dto: CreateLocationDto,
  ): Promise<BaseApiResponse<Location>> {
    this.logger.log(ctx, `${this.create.name} was called`);

    const location = await this.createLocationUseCase.execute(
      ctx.user?.id.toString() || uuidv4(),
      dto,
    );
    return { data: location, meta: {} };
  }

  @UseInterceptors(ClassSerializerInterceptor)
  @Get(':id')
  @ApiOperation({
    summary: 'Get location by id API',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    type: SwaggerBaseApiResponse(Location),
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    type: BaseApiErrorResponse,
  })
  async findOne(
    @ReqContext() ctx: RequestContext,
    @Param('id') id: string,
  ): Promise<BaseApiResponse<Location>> {
    this.logger.log(ctx, `${this.findOne.name} was called`);

    const location = await this.locationService.findOne(id);
    if (!location) {
      throw new NotFoundException('Location not found');
    }

    return { data: location, meta: {} };
  }

  @UseInterceptors(ClassSerializerInterceptor)
  @Get()
  @ApiOperation({
    summary: 'Get locations list API',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    type: SwaggerBaseApiResponse([Location]),
  })
  async findAll(
    @ReqContext() ctx: RequestContext,
  ): Promise<BaseApiResponse<Location[]>> {
    this.logger.log(ctx, `${this.findAll.name} was called`);
    const locations = await this.locationService.findAll();
    return { data: locations, meta: {} };
  }

  @UseInterceptors(ClassSerializerInterceptor)
  @Put(':id')
  @ApiOperation({
    summary: 'Update location API',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    type: SwaggerBaseApiResponse(Location),
  })
  async update(
    @ReqContext() ctx: RequestContext,
    @Param('id') id: string,
    @Body() dto: UpdateLocationDto,
  ): Promise<BaseApiResponse<Location>> {
    this.logger.log(ctx, `${this.update.name} was called`);
    const location = await this.updateLocationUseCase.execute(id, dto);
    return { data: location, meta: {} };
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Delete location API',
  })
  @ApiResponse({
    status: HttpStatus.NO_CONTENT,
  })
  async delete(
    @ReqContext() ctx: RequestContext,
    @Param('id') id: string,
  ): Promise<void> {
    this.logger.log(ctx, `${this.delete.name} was called`);
    await this.locationService.delete(id);
  }
}
