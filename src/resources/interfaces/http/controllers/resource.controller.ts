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
  Patch,
  Post,
  Query,
  UseInterceptors,
} from '@nestjs/common';
import { ApiOperation, ApiQuery,ApiResponse, ApiTags } from '@nestjs/swagger';
import { v4 as uuidv4 } from 'uuid';

import {
  BaseApiErrorResponse,
  BaseApiResponse,
  SwaggerBaseApiResponse,
} from '../../../../shared/dtos/base-api-response.dto';
import { AppLogger } from '../../../../shared/logger/logger.service';
import { ReqContext } from '../../../../shared/request-context/req-context.decorator';
import { RequestContext } from '../../../../shared/request-context/request-context.dto';
import { CreateResourceDto } from '../../../application/dto/create-resource.dto';
import { UpdateResourceDto } from '../../../application/dto/update-resource.dto';
import { ResourceService } from '../../../application/services/resource.service';
import { Resource } from '../../../domain/entities/resource.entity';

@ApiTags('resources')
@Controller('resources')
export class ResourceController {
  constructor(
    private readonly resourceService: ResourceService,
    private readonly logger: AppLogger,
  ) {
    this.logger.setContext(ResourceController.name);
  }

  @UseInterceptors(ClassSerializerInterceptor)
  @Post()
  @ApiOperation({
    summary: 'Create a new resource',
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    type: SwaggerBaseApiResponse(Resource),
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    type: BaseApiErrorResponse,
  })
  async create(
    @ReqContext() ctx: RequestContext,
    @Body() dto: CreateResourceDto,
  ): Promise<BaseApiResponse<Resource>> {
    this.logger.log(ctx, `${this.create.name} was called`);

    const resource = new Resource(
      uuidv4(),
      dto.name,
      dto.category,
      dto.quantity,
      new Date(),
      new Date(),
    );
    await this.resourceService.create(resource);
    return { data: resource, meta: {} };
  }

  @UseInterceptors(ClassSerializerInterceptor)
  @Get()
  @ApiOperation({
    summary: 'Get all resources with optional filters',
  })
  @ApiQuery({
    name: 'category',
    type: 'string',
    required: false,
    description: 'Filter by category',
  })
  @ApiQuery({
    name: 'name',
    type: 'string',
    required: false,
    description: 'Filter by name',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    type: SwaggerBaseApiResponse([Resource]),
  })
  async findAll(
    @ReqContext() ctx: RequestContext,
    @Query('category') category?: string,
    @Query('name') name?: string,
  ): Promise<BaseApiResponse<Resource[]>> {
    this.logger.log(ctx, `${this.findAll.name} was called`);

    let resources: Resource[];
    if (category) {
      resources = await this.resourceService.findByCategory(category);
    } else if (name) {
      resources = await this.resourceService.findByName(name);
    } else {
      resources = await this.resourceService.findAll();
    }

    return { data: resources, meta: {} };
  }

  @UseInterceptors(ClassSerializerInterceptor)
  @Get(':id')
  @ApiOperation({
    summary: 'Get a single resource by ID',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    type: SwaggerBaseApiResponse(Resource),
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    type: BaseApiErrorResponse,
  })
  async findOne(
    @ReqContext() ctx: RequestContext,
    @Param('id') id: string,
  ): Promise<BaseApiResponse<Resource>> {
    this.logger.log(ctx, `${this.findOne.name} was called`);

    const resource = await this.resourceService.findOne(id);
    if (!resource) {
      throw new NotFoundException('Resource not found');
    }

    return { data: resource, meta: {} };
  }

  @UseInterceptors(ClassSerializerInterceptor)
  @Patch(':id')
  @ApiOperation({
    summary: 'Update a resource',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    type: SwaggerBaseApiResponse(Resource),
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    type: BaseApiErrorResponse,
  })
  async update(
    @ReqContext() ctx: RequestContext,
    @Param('id') id: string,
    @Body() dto: UpdateResourceDto,
  ): Promise<BaseApiResponse<Resource>> {
    this.logger.log(ctx, `${this.update.name} was called`);

    const resource = await this.resourceService.findOne(id);
    if (!resource) {
      throw new NotFoundException('Resource not found');
    }

    if (
      dto.name !== undefined ||
      dto.category !== undefined ||
      dto.quantity !== undefined
    ) {
      resource.update(
        dto.name ?? resource.getName(),
        dto.category ?? resource.getCategory(),
        dto.quantity ?? resource.getQuantity(),
      );
      await this.resourceService.update(resource);
    }

    return { data: resource, meta: {} };
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Delete a resource',
  })
  @ApiResponse({
    status: HttpStatus.NO_CONTENT,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    type: BaseApiErrorResponse,
  })
  async delete(
    @ReqContext() ctx: RequestContext,
    @Param('id') id: string,
  ): Promise<void> {
    this.logger.log(ctx, `${this.delete.name} was called`);

    const resource = await this.resourceService.findOne(id);
    if (!resource) {
      throw new NotFoundException('Resource not found');
    }

    await this.resourceService.delete(id);
  }
}
