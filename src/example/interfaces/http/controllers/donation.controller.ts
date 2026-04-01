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
import { CreateDonationDto } from '../../../application/dto/create-donation.dto';
import { UpdateDonationDto } from '../../../application/dto/update-donation.dto';
import { DonationService } from '../../../application/services/donation.service';
import { CreateDonationUseCase } from '../../../application/use-cases/create/create-donation.use-case';
import { CreateDonationCampagnUseCase } from '../../../application/use-cases/create/create-donation-campaign.use-case';
import { UpdateDonationUseCase } from '../../../application/use-cases/update/update-donation.use-case';
import { Donation } from '../../../domain/entities/donation.entity';

@ApiTags('donations')
@Controller('donations')
export class DonationController {
  constructor(
    private readonly createDonationUseCase: CreateDonationUseCase,
    private readonly createDisasterFromIncidentUseCase: CreateDonationCampagnUseCase,
    private readonly updateDonationUseCase: UpdateDonationUseCase,
    private readonly donationService: DonationService,
    private readonly logger: AppLogger,
  ) {
    this.logger.setContext(DonationController.name);
  }

  @UseInterceptors(ClassSerializerInterceptor)
  @Post()
  @ApiOperation({
    summary: 'Create disaster API',
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    type: SwaggerBaseApiResponse(Donation),
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    type: BaseApiErrorResponse,
  })
  async create(
    @ReqContext() ctx: RequestContext,
    @Body() dto: CreateDonationDto,
  ): Promise<BaseApiResponse<Donation>> {
    this.logger.log(ctx, `${this.create.name} was called`);

    const disaster = await this.createDonationUseCase.execute(
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
    type: SwaggerBaseApiResponse(Donation),
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    type: BaseApiErrorResponse,
  })
  async findOne(
    @ReqContext() ctx: RequestContext,
    @Param('id') id: string,
  ): Promise<BaseApiResponse<Donation>> {
    this.logger.log(ctx, `${this.findOne.name} was called`);

    const disaster = await this.donationService.findOne(id);
    if (!disaster) {
      throw new NotFoundException('Donation not found');
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
    type: SwaggerBaseApiResponse([Donation]),
  })
  async findAll(
    @ReqContext() ctx: RequestContext,
  ): Promise<BaseApiResponse<Donation[]>> {
    this.logger.log(ctx, `${this.findAll.name} was called`);
    const incidents = await this.donationService.findAll();
    return { data: incidents, meta: {} };
  }

  @UseInterceptors(ClassSerializerInterceptor)
  @Put(':id')
  @ApiOperation({
    summary: 'Update disaster API',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    type: SwaggerBaseApiResponse(Donation),
  })
  async update(
    @ReqContext() ctx: RequestContext,
    @Param('id') id: string,
    @Body() dto: UpdateDonationDto,
  ): Promise<BaseApiResponse<Donation>> {
    this.logger.log(ctx, `${this.update.name} was called`);
    const disaster = await this.updateDonationUseCase.execute(id, dto);
    return { data: disaster, meta: {} };
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
    await this.donationService.delete(id);
  }
}
