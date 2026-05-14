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

import {
  BaseApiErrorResponse,
  BaseApiResponse,
  SwaggerBaseApiResponse,
} from '../../../../shared/dtos/base-api-response.dto';
import { AppLogger } from '../../../../shared/logger/logger.service';
import { ReqContext } from '../../../../shared/request-context/req-context.decorator';
import { RequestContext } from '../../../../shared/request-context/request-context.dto';
import { CreateInventoryItemDto } from '../../../application/dto/create-inventory-item.dto';
import { UpdateInventoryItemStockDto } from '../../../application/dto/update-inventory-item.dto';
import { InventoryItemsService } from '../../../application/services/inventory-items.service';
import { InventoryItems } from '../../../domain/entities/inventory-items.entity';

@ApiTags('resources/inventory')
@Controller('resources/inventory')
export class InventoryController {
  constructor(
    private readonly inventoryService: InventoryItemsService,
    private readonly logger: AppLogger,
  ) {
    this.logger.setContext(InventoryController.name);
  }

  @UseInterceptors(ClassSerializerInterceptor)
  @Post()
  @ApiOperation({
    summary: 'Add a new inventory item linked to a resource',
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    type: SwaggerBaseApiResponse(InventoryItems),
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    type: BaseApiErrorResponse,
  })
  async create(
    @ReqContext() ctx: RequestContext,
    @Body() dto: CreateInventoryItemDto,
  ): Promise<BaseApiResponse<InventoryItems>> {
    this.logger.log(ctx, `${this.create.name} was called`);

    const item = await this.inventoryService.create(dto);
    return { data: item, meta: {} };
  }

  @UseInterceptors(ClassSerializerInterceptor)
  @Get()
  @ApiOperation({
    summary: 'Get all inventory items with optional location filter',
  })
  @ApiQuery({
    name: 'location',
    type: 'string',
    required: false,
    description: 'Filter by location',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    type: SwaggerBaseApiResponse([InventoryItems]),
  })
  async findAll(
    @ReqContext() ctx: RequestContext,
    @Query('location') location?: string,
  ): Promise<BaseApiResponse<InventoryItems[]>> {
    this.logger.log(ctx, `${this.findAll.name} was called`);

    let items: InventoryItems[];
    if (location) {
      items = await this.inventoryService.findByLocation(location);
    } else {
      items = await this.inventoryService.findAll();
    }

    return { data: items, meta: {} };
  }

  @UseInterceptors(ClassSerializerInterceptor)
  @Get(':id')
  @ApiOperation({
    summary: 'Get a single inventory item by ID',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    type: SwaggerBaseApiResponse(InventoryItems),
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    type: BaseApiErrorResponse,
  })
  async findOne(
    @ReqContext() ctx: RequestContext,
    @Param('id') id: string,
  ): Promise<BaseApiResponse<InventoryItems>> {
    this.logger.log(ctx, `${this.findOne.name} was called`);

    const item = await this.inventoryService.findOne(id);
    if (!item) {
      throw new NotFoundException('Inventory item not found');
    }

    return { data: item, meta: {} };
  }

  @UseInterceptors(ClassSerializerInterceptor)
  @Patch(':id/stock')
  @ApiOperation({
    summary:
      'Update stock quantity (validate that quantity does not go below 0)',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    type: SwaggerBaseApiResponse(InventoryItems),
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    type: BaseApiErrorResponse,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    type: BaseApiErrorResponse,
  })
  async updateStock(
    @ReqContext() ctx: RequestContext,
    @Param('id') id: string,
    @Body() dto: UpdateInventoryItemStockDto,
  ): Promise<BaseApiResponse<InventoryItems>> {
    this.logger.log(ctx, `${this.updateStock.name} was called`);

    const item = await this.inventoryService.findOne(id);
    if (!item) {
      throw new NotFoundException('Inventory item not found');
    }

    const updatedItem = await this.inventoryService.updateStock(
      id,
      dto.quantity,
    );
    return { data: updatedItem, meta: {} };
  }

  @UseInterceptors(ClassSerializerInterceptor)
  @Get(':id/availability')
  @ApiOperation({
    summary: 'Check if a requested quantity is available',
  })
  @ApiQuery({
    name: 'qty',
    type: 'number',
    required: true,
    description: 'Quantity to check for availability',
  })
  @ApiResponse({
    status: HttpStatus.OK,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    type: BaseApiErrorResponse,
  })
  async checkAvailability(
    @ReqContext() ctx: RequestContext,
    @Param('id') id: string,
    @Query('qty') qty?: string,
  ): Promise<BaseApiResponse<any>> {
    this.logger.log(ctx, `${this.checkAvailability.name} was called`);

    if (!qty) {
      throw new BadRequestException('Query parameter "qty" is required');
    }

    const requiredQuantity = parseInt(qty, 10);
    if (isNaN(requiredQuantity) || requiredQuantity < 0) {
      throw new BadRequestException(
        'Query parameter "qty" must be a non-negative number',
      );
    }

    const item = await this.inventoryService.findOne(id);
    if (!item) {
      throw new NotFoundException('Inventory item not found');
    }

    const availability = await this.inventoryService.checkAvailability(
      id,
      requiredQuantity,
    );
    return { data: availability, meta: {} };
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Remove an inventory item',
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

    const item = await this.inventoryService.findOne(id);
    if (!item) {
      throw new NotFoundException('Inventory item not found');
    }

    await this.inventoryService.delete(id);
  }
}
