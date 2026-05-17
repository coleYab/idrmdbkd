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
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  UseInterceptors,
  BadRequestException,
} from '@nestjs/common';
import { ApiOperation, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';

import { AppLogger } from '../../../../shared/logger/logger.service';
import { ReqContext } from '../../../../shared/request-context/req-context.decorator';
import { RequestContext } from '../../../../shared/request-context/request-context.dto';
import { ErtService } from '../../../application/services/ert.service';
import { ErtUnit } from '../../../domain/entities/ert-unit.entity';

@ApiTags('ert')
@Controller('ert')
export class ErtController {
  constructor(
    private readonly service: ErtService,
    private readonly logger: AppLogger,
  ) {
    this.logger.setContext(ErtController.name);
  }

  @UseInterceptors(ClassSerializerInterceptor)
  @Post()
  @ApiOperation({ summary: 'Create an ERT unit' })
  @ApiResponse({ status: HttpStatus.CREATED, type: ErtUnit })
  async create(
    @ReqContext() ctx: RequestContext,
    @Body()
    body: {
      name: string;
      region?: string;
      latitude?: number;
      longitude?: number;
    },
  ) {
    if (!body.name) throw new BadRequestException('name is required');
    const unit = await this.service.create(body);
    return { data: unit, meta: {} };
  }

  @UseInterceptors(ClassSerializerInterceptor)
  @Get()
  @ApiOperation({ summary: 'List ERT units' })
  @ApiQuery({ name: 'region', required: false })
  async findAll(
    @ReqContext() ctx: RequestContext,
    @Query('region') region?: string,
  ) {
    const units = region
      ? await this.service.findByRegion(region)
      : await this.service.findAll();
    return { data: units, meta: {} };
  }

  @UseInterceptors(ClassSerializerInterceptor)
  @Get(':id([0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12})')
  async findOne(
    @ReqContext() ctx: RequestContext,
    @Param('id') id: string,
  ) {
    const unit = await this.service.findOne(id);
    if (!unit) throw new NotFoundException('ERT unit not found');
    return { data: unit, meta: {} };
  }

  @Patch(':id/location')
  async updateLocation(
    @ReqContext() ctx: RequestContext,
    @Param('id') id: string,
    @Body() body: { latitude: number; longitude: number },
  ) {
    if (typeof body.latitude !== 'number' || typeof body.longitude !== 'number')
      throw new BadRequestException('latitude and longitude are required');
    const unit = await this.service.updateLocation(
      id,
      body.latitude,
      body.longitude,
    );
    return { data: unit, meta: {} };
  }

  @Patch(':id/status')
  async updateStatus(
    @ReqContext() ctx: RequestContext,
    @Param('id') id: string,
    @Body() body: { status: string },
  ) {
    if (!body.status) throw new BadRequestException('status is required');
    const unit = await this.service.updateStatus(id, body.status);
    return { data: unit, meta: {} };
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async delete(@ReqContext() ctx: RequestContext, @Param('id') id: string) {
    await this.service.delete(id);
  }
}
