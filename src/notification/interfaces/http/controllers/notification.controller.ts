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
import { CreateNotificationDto } from '../../../application/dto/create-notification.dto';
import { UpdateNotificationDto } from '../../../application/dto/update-notification.dto';
import { NotificationService } from '../../../application/services/notification.service';
import { CreateNotificationUseCase } from '../../../application/use-cases/create/create-notification.use-case';
import { CreateNotificationCampaignUseCase } from '../../../application/use-cases/create/create-notification-campaign.use-case';
import { UpdateNotificationUseCase } from '../../../application/use-cases/update/update-notification.use-case';
import { Notification } from '../../../domain/entities/notification.entity';

@ApiTags('notifications')
@Controller('notifications')
export class NotificationController {
  constructor(
    private readonly createNotificationUseCase: CreateNotificationUseCase,
    private readonly createNotificationCampaignUseCase: CreateNotificationCampaignUseCase,
    private readonly updateNotificationUseCase: UpdateNotificationUseCase,
    private readonly notificationService: NotificationService,
    private readonly logger: AppLogger,
  ) {
    this.logger.setContext(NotificationController.name);
  }

  @UseInterceptors(ClassSerializerInterceptor)
  @Post()
  @ApiOperation({
    summary: 'Create notification API',
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    type: SwaggerBaseApiResponse(Notification),
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    type: BaseApiErrorResponse,
  })
  async create(
    @ReqContext() ctx: RequestContext,
    @Body() dto: CreateNotificationDto,
  ): Promise<BaseApiResponse<Notification>> {
    this.logger.log(ctx, `${this.create.name} was called`);

    const notification = await this.createNotificationUseCase.execute(
      ctx.user?.id.toString() || uuidv4(),
      dto,
    );
    return { data: notification, meta: {} };
  }

  @UseInterceptors(ClassSerializerInterceptor)
  @Get(':id')
  @ApiOperation({
    summary: 'Get notification by id API',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    type: SwaggerBaseApiResponse(Notification),
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    type: BaseApiErrorResponse,
  })
  async findOne(
    @ReqContext() ctx: RequestContext,
    @Param('id') id: string,
  ): Promise<BaseApiResponse<Notification>> {
    this.logger.log(ctx, `${this.findOne.name} was called`);

    const notification = await this.notificationService.findOne(id);
    if (!notification) {
      throw new NotFoundException('Notification not found');
    }

    return { data: notification, meta: {} };
  }

  @UseInterceptors(ClassSerializerInterceptor)
  @Get()
  @ApiOperation({
    summary: 'Get notifications list API',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    type: SwaggerBaseApiResponse([Notification]),
  })
  async findAll(
    @ReqContext() ctx: RequestContext,
  ): Promise<BaseApiResponse<Notification[]>> {
    this.logger.log(ctx, `${this.findAll.name} was called`);
    const notifications = await this.notificationService.findAll();
    return { data: notifications, meta: {} };
  }

  @UseInterceptors(ClassSerializerInterceptor)
  @Put(':id')
  @ApiOperation({
    summary: 'Update notification API',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    type: SwaggerBaseApiResponse(Notification),
  })
  async update(
    @ReqContext() ctx: RequestContext,
    @Param('id') id: string,
    @Body() dto: UpdateNotificationDto,
  ): Promise<BaseApiResponse<Notification>> {
    this.logger.log(ctx, `${this.update.name} was called`);
    const notification = await this.updateNotificationUseCase.execute(id, dto);
    return { data: notification, meta: {} };
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Delete notification API',
  })
  @ApiResponse({
    status: HttpStatus.NO_CONTENT,
  })
  async delete(
    @ReqContext() ctx: RequestContext,
    @Param('id') id: string,
  ): Promise<void> {
    this.logger.log(ctx, `${this.delete.name} was called`);
    await this.notificationService.delete(id);
  }
}
