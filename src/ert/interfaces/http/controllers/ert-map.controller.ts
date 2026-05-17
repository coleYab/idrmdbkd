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

@ApiTags('ert-map')
@Controller('ert-map')
export class ErtMapController {
  constructor(
    private readonly service: ErtService,
    private readonly logger: AppLogger,
  ) {
    this.logger.setContext(ErtMapController.name);
  }

  @Get()
  @ApiOperation({ summary: 'Get all ERT units for map visualization' })
  @ApiResponse({ status: HttpStatus.OK, type: ErtUnit, isArray: true })
  async getAllForMap(@ReqContext() ctx: RequestContext) {
    const units = await this.service.findAll();
    return { data: units, meta: {} };
  }

  @Get('nearby')
  @ApiOperation({ summary: 'Get nearby ERT units for map visualization' })
  @ApiQuery({ name: 'lat', required: false })
  @ApiQuery({ name: 'lon', required: false })
  @ApiQuery({ name: 'radiusKm', required: false })
  async getNearbyForMap(
    @ReqContext() ctx: RequestContext,
    @Query('lat') lat?: string,
    @Query('lon') lon?: string,
    @Query('radiusKm') radiusKm?: string,
  ) {
    if (!lat || !lon) {
      // If no coordinates provided, return all units
      const units = await this.service.findAll();
      return { data: units, meta: {} };
    }

    const latitude = parseFloat(lat);
    const longitude = parseFloat(lon);
    const radius = radiusKm ? parseFloat(radiusKm) * 1000 : 50000;

    if (isNaN(latitude) || isNaN(longitude)) {
      throw new BadRequestException('Invalid latitude or longitude');
    }

    const units = await this.service.findNearby(
      latitude,
      longitude,
      Math.round(radius),
    );
    return { data: units, meta: {} };
  }
}
