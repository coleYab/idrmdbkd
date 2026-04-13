import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Get,
  Header,
  Headers,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
  Res,
  UseInterceptors,
} from '@nestjs/common';
import {
  ApiHeader,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { Response } from 'express';

import {
  BaseApiErrorResponse,
  BaseApiResponse,
  SwaggerBaseApiResponse,
} from '../../../../shared/dtos/base-api-response.dto';
import { AppLogger } from '../../../../shared/logger/logger.service';
import { ReqContext } from '../../../../shared/request-context/req-context.decorator';
import { RequestContext } from '../../../../shared/request-context/request-context.dto';
import { CampaignResponse } from '../../../application/dto/campaign-response.dto';
import { ChapaWebhookPayload } from '../../../application/dto/chapa-webhook-payload.dto';
import { CreateCampaignRequest } from '../../../application/dto/create-campaign-request.dto';
import { DonationStatusResponse } from '../../../application/dto/donation-status-response.dto';
import { InitializeDonationRequest } from '../../../application/dto/initialize-donation-request.dto';
import { InitializeDonationResponse } from '../../../application/dto/initialize-donation-response.dto';
import { ListCampaignsQueryDto } from '../../../application/dto/list-campaigns-query.dto';
import { UpdateCampaignStatusRequest } from '../../../application/dto/update-campaign-status-request.dto';
import { DonationCampaignService } from '../../../application/services/donation-campaign.service';
import { DonationTransactionService } from '../../../application/services/donation-transaction.service';

@ApiTags('donations')
@Controller('donations')
export class DonationController {
  constructor(
    private readonly donationCampaignService: DonationCampaignService,
    private readonly donationTransactionService: DonationTransactionService,
    private readonly logger: AppLogger,
  ) {
    this.logger.setContext(DonationController.name);
  }

  @UseInterceptors(ClassSerializerInterceptor)
  @Post('campaigns')
  @ApiOperation({
    summary: 'Create donation campaign',
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    type: SwaggerBaseApiResponse(CampaignResponse),
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    type: BaseApiErrorResponse,
  })
  async createCampaign(
    @ReqContext() ctx: RequestContext,
    @Body() dto: CreateCampaignRequest,
  ): Promise<BaseApiResponse<CampaignResponse>> {
    this.logger.log(ctx, `${this.createCampaign.name} was called`);

    const campaign = await this.donationCampaignService.createCampaign(dto);
    return { data: CampaignResponse.fromDomain(campaign), meta: {} };
  }

  @UseInterceptors(ClassSerializerInterceptor)
  @Get('campaigns')
  @ApiOperation({
    summary: 'List donation campaigns',
  })
  @ApiQuery({ name: 'status', required: false })
  @ApiQuery({ name: 'disasterId', required: false })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  @ApiResponse({
    status: HttpStatus.OK,
    type: SwaggerBaseApiResponse([CampaignResponse]),
  })
  async listCampaigns(
    @ReqContext() ctx: RequestContext,
    @Query() query: ListCampaignsQueryDto,
  ): Promise<BaseApiResponse<CampaignResponse[]>> {
    this.logger.log(ctx, `${this.listCampaigns.name} was called`);

    const [campaigns, total, page, limit] =
      await this.donationCampaignService.listCampaigns(query);

    return {
      data: campaigns.map((campaign) => CampaignResponse.fromDomain(campaign)),
      meta: { total, page, limit },
    };
  }

  @UseInterceptors(ClassSerializerInterceptor)
  @Get('campaigns/:campaignId')
  @ApiOperation({
    summary: 'Get campaign by id',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    type: SwaggerBaseApiResponse(CampaignResponse),
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    type: BaseApiErrorResponse,
  })
  async findCampaignById(
    @ReqContext() ctx: RequestContext,
    @Param('campaignId') campaignId: string,
  ): Promise<BaseApiResponse<CampaignResponse>> {
    this.logger.log(ctx, `${this.findCampaignById.name} was called`);

    const campaign =
      await this.donationCampaignService.findCampaignById(campaignId);

    return { data: CampaignResponse.fromDomain(campaign), meta: {} };
  }

  @UseInterceptors(ClassSerializerInterceptor)
  @Patch('campaigns/:campaignId/status')
  @ApiOperation({
    summary: 'Change campaign lifecycle status',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    type: SwaggerBaseApiResponse(CampaignResponse),
  })
  async updateCampaignStatus(
    @ReqContext() ctx: RequestContext,
    @Param('campaignId') campaignId: string,
    @Body() dto: UpdateCampaignStatusRequest,
  ): Promise<BaseApiResponse<CampaignResponse>> {
    this.logger.log(ctx, `${this.updateCampaignStatus.name} was called`);

    const campaign = await this.donationCampaignService.changeCampaignStatus(
      campaignId,
      dto,
    );

    return { data: CampaignResponse.fromDomain(campaign), meta: {} };
  }

  @UseInterceptors(ClassSerializerInterceptor)
  @Post('initialize')
  @ApiOperation({
    summary: 'Initialize donation transaction with Chapa',
  })
  @ApiHeader({
    name: 'Idempotency-Key',
    required: false,
    description: 'Idempotency key to avoid duplicate donation initialization',
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    type: SwaggerBaseApiResponse(InitializeDonationResponse),
  })
  async initializeDonation(
    @ReqContext() ctx: RequestContext,
    @Body() dto: InitializeDonationRequest,
    @Headers('idempotency-key') idempotencyKeyHeader?: string,
  ): Promise<BaseApiResponse<InitializeDonationResponse>> {
    this.logger.log(ctx, `${this.initializeDonation.name} was called`);

    const data = await this.donationTransactionService.initializeDonation(
      ctx,
      dto,
      dto.idempotencyKey || idempotencyKeyHeader || '',
    );

    return { data, meta: {} };
  }

  @UseInterceptors(ClassSerializerInterceptor)
  @Post('webhooks/chapa')
  @Header('Cache-Control', 'no-store')
  @ApiOperation({
    summary: 'Handle Chapa payment webhook',
  })
  @ApiHeader({ name: 'Chapa-Signature', required: true })
  @ApiResponse({
    status: HttpStatus.OK,
    type: SwaggerBaseApiResponse(Object),
  })
  async chapaWebhook(
    @ReqContext() ctx: RequestContext,
    @Body() payload: ChapaWebhookPayload,
    @Headers('chapa-signature') chapaSignature: string,
  ): Promise<BaseApiResponse<{ received: boolean }>> {
    this.logger.log(ctx, `${this.chapaWebhook.name} was called`);

    await this.donationTransactionService.handleChapaWebhook(
      ctx,
      payload,
      chapaSignature,
    );

    return { data: { received: true }, meta: {} };
  }

  @UseInterceptors(ClassSerializerInterceptor)
  @Get(':donationId/status')
  @ApiOperation({
    summary: 'Get donation processing status',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    type: SwaggerBaseApiResponse(DonationStatusResponse),
  })
  async getDonationStatus(
    @ReqContext() ctx: RequestContext,
    @Param('donationId') donationId: string,
  ): Promise<BaseApiResponse<DonationStatusResponse>> {
    this.logger.log(ctx, `${this.getDonationStatus.name} was called`);
    const data =
      await this.donationTransactionService.getDonationStatus(donationId);
    return { data, meta: {} };
  }

  @Get(':donationId/receipt')
  @ApiOperation({
    summary: 'Download donation receipt PDF',
  })
  @ApiParam({ name: 'donationId', type: String })
  async getReceipt(
    @ReqContext() ctx: RequestContext,
    @Param('donationId') donationId: string,
    @Query('token') token: string | undefined,
    @Res({ passthrough: true }) res: Response,
  ): Promise<Buffer> {
    this.logger.log(ctx, `${this.getReceipt.name} was called`);
    const receipt = await this.donationTransactionService.generateReceipt(
      donationId,
      token,
    );

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="${receipt.filename}"`,
    );
    return receipt.content;
  }
}
