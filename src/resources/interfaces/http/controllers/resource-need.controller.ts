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
  Patch,
  Post,
  Query,
  UseInterceptors,
} from '@nestjs/common';
import { ApiOperation, ApiQuery,ApiResponse, ApiTags } from '@nestjs/swagger';

import {
  BaseApiErrorResponse,
  BaseApiResponse,
  SwaggerBaseApiResponse,
} from '../../../../shared/dtos/base-api-response.dto';
import { AppLogger } from '../../../../shared/logger/logger.service';
import { ReqContext } from '../../../../shared/request-context/req-context.decorator';
import { RequestContext } from '../../../../shared/request-context/request-context.dto';
import { CreateResourceNeedDto } from '../../../application/dto/create-resource-need.dto';
import { UpdateResourceNeedStatusDto } from '../../../application/dto/update-resource-need.dto';
import { ResourceNeedService } from '../../../application/services/resource-need.service';
import { ResourceNeed } from '../../../domain/entities/resource-need.entity';

@ApiTags('resources/needs')
@Controller('resources/needs')
export class ResourceNeedController {
  constructor(
    private readonly resourceNeedService: ResourceNeedService,
    private readonly logger: AppLogger,
  ) {
    this.logger.setContext(ResourceNeedController.name);
  }

  @UseInterceptors(ClassSerializerInterceptor)
  @Post()
  @ApiOperation({
    summary: 'Create a new resource need',
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    type: SwaggerBaseApiResponse(ResourceNeed),
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    type: BaseApiErrorResponse,
  })
  async create(
    @ReqContext() ctx: RequestContext,
    @Body() dto: CreateResourceNeedDto,
  ): Promise<BaseApiResponse<ResourceNeed>> {
    this.logger.log(ctx, `${this.create.name} was called`);

    const need = await this.resourceNeedService.create(dto);
    return { data: need, meta: {} };
  }

  @UseInterceptors(ClassSerializerInterceptor)
  @Get()
  @ApiOperation({
    summary: 'Get all resource needs with optional filters',
  })
  @ApiQuery({
    name: 'status',
    type: 'string',
    required: false,
    description: 'Filter by status (pending, in_progress, satisfied)',
  })
  @ApiQuery({
    name: 'priority',
    type: 'string',
    required: false,
    description: 'Filter by priority (low, medium, high)',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    type: SwaggerBaseApiResponse([ResourceNeed]),
  })
  async findAll(
    @ReqContext() ctx: RequestContext,
    @Query('status') status?: string,
    @Query('priority') priority?: string,
  ): Promise<BaseApiResponse<ResourceNeed[]>> {
    this.logger.log(ctx, `${this.findAll.name} was called`);

    let needs: ResourceNeed[];
    if (status) {
      needs = await this.resourceNeedService.findByStatus(status);
    } else if (priority) {
      needs = await this.resourceNeedService.findByPriority(priority);
    } else {
      needs = await this.resourceNeedService.findAll();
    }

    return { data: needs, meta: {} };
  }

  @UseInterceptors(ClassSerializerInterceptor)
  @Get(':id')
  @ApiOperation({
    summary: 'Get a single resource need by ID',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    type: SwaggerBaseApiResponse(ResourceNeed),
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    type: BaseApiErrorResponse,
  })
  async findOne(
    @ReqContext() ctx: RequestContext,
    @Param('id') id: string,
  ): Promise<BaseApiResponse<ResourceNeed>> {
    this.logger.log(ctx, `${this.findOne.name} was called`);

    const need = await this.resourceNeedService.findOne(id);
    if (!need) {
      throw new NotFoundException('Resource need not found');
    }

    return { data: need, meta: {} };
  }

  @UseInterceptors(ClassSerializerInterceptor)
  @Patch(':id/status')
  @ApiOperation({
    summary: 'Update the status of a resource need',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    type: SwaggerBaseApiResponse(ResourceNeed),
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    type: BaseApiErrorResponse,
  })
  async updateStatus(
    @ReqContext() ctx: RequestContext,
    @Param('id') id: string,
    @Body() dto: UpdateResourceNeedStatusDto,
  ): Promise<BaseApiResponse<ResourceNeed>> {
    this.logger.log(ctx, `${this.updateStatus.name} was called`);

    const need = await this.resourceNeedService.updateStatus(
      id,
      dto.status as any,
    );
    return { data: need, meta: {} };
  }

  @UseInterceptors(ClassSerializerInterceptor)
  @Patch(':id/approve')
  @ApiOperation({
    summary: 'Approve a resource need (used by Response Team role)',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    type: SwaggerBaseApiResponse(ResourceNeed),
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    type: BaseApiErrorResponse,
  })
  async approve(
    @ReqContext() ctx: RequestContext,
    @Param('id') id: string,
  ): Promise<BaseApiResponse<ResourceNeed>> {
    this.logger.log(ctx, `${this.approve.name} was called`);

    const need = await this.resourceNeedService.approve(id);
    return { data: need, meta: {} };
  }

  @UseInterceptors(ClassSerializerInterceptor)
  @Get(':id/fulfillment')
  @ApiOperation({
    summary: 'Track fulfillment progress of a resource need',
  })
  @ApiResponse({
    status: HttpStatus.OK,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    type: BaseApiErrorResponse,
  })
  async getFulfillmentProgress(
    @ReqContext() ctx: RequestContext,
    @Param('id') id: string,
  ): Promise<BaseApiResponse<any>> {
    this.logger.log(ctx, `${this.getFulfillmentProgress.name} was called`);

    const progress = await this.resourceNeedService.getFulfillmentProgress(id);
    return { data: progress, meta: {} };
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Delete a resource need',
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

    const need = await this.resourceNeedService.findOne(id);
    if (!need) {
      throw new NotFoundException('Resource need not found');
    }

    await this.resourceNeedService.delete(id);
  }
}
