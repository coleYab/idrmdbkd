import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';

import { AppLogger } from '../../../shared/logger/logger.service';
import { RequestContext } from '../../../shared/request-context/request-context.dto';
import { Donation } from '../../domain/entities/donation.entity';
import { DonationStatus } from '../../domain/enums/donation-status.enum';
import { PaymentMethod } from '../../domain/enums/payment-method.enum';
import {
  DONATION_REPOSITORY,
  DonationRepository,
} from '../../domain/repositories/donation.repository';
import { DonorInfo } from '../../domain/value-objects/donor-info.vo';
import { ChapaClient } from '../../infrastructure/services/chapa.client';
import { buildSimplePdfReceipt } from '../../infrastructure/services/receipt-pdf.builder';
import { ChapaWebhookPayload } from '../dto/chapa-webhook-payload.dto';
import { DonationStatusResponse } from '../dto/donation-status-response.dto';
import { InitializeDonationRequest } from '../dto/initialize-donation-request.dto';
import { InitializeDonationResponse } from '../dto/initialize-donation-response.dto';
import { DonationCampaignService } from './donation-campaign.service';

@Injectable()
export class DonationTransactionService {
  constructor(
    @Inject(DONATION_REPOSITORY)
    private readonly donationRepository: DonationRepository,
    private readonly campaignService: DonationCampaignService,
    private readonly chapaClient: ChapaClient,
    private readonly logger: AppLogger,
  ) {
    this.logger.setContext(DonationTransactionService.name);
  }

  public async initializeDonation(
    ctx: RequestContext,
    dto: InitializeDonationRequest,
    idempotencyKey: string,
  ): Promise<InitializeDonationResponse> {
    if (!idempotencyKey) {
      throw new BadRequestException('Idempotency key is required');
    }

    const cached =
      await this.donationRepository.findByIdempotencyKey(idempotencyKey);
    if (cached?.getCheckoutUrl()) {
      return {
        checkoutUrl: cached.getCheckoutUrl()!,
        donationId: cached.getDonationID(),
        tx_ref: cached.getTransactionReference(),
      };
    }

    const campaign = await this.campaignService.findCampaignById(
      dto.campaignID,
    );
    if (campaign.getStatus() !== 'ACTIVE') {
      throw new BadRequestException('Campaign must be ACTIVE before donating');
    }

    const donation = Donation.create(
      uuidv4(),
      dto.campaignID,
      `DON-${uuidv4()}`,
      dto.amount,
      dto.currency,
      PaymentMethod.CHAPA,
      new DonorInfo(
        dto.donor.fullName,
        dto.donor.email,
        dto.donor.phoneNumber,
        dto.donor.isAnonymous,
      ),
    );
    donation.initialize(idempotencyKey);
    await this.donationRepository.save(donation);

    try {
      const chapaResponse = await this.chapaClient.initializeTransaction({
        txRef: donation.getTransactionReference(),
        amount: donation.getAmount(),
        currency: donation.getCurrency(),
        donor: donation.getDonor(),
      });

      donation.markAsPending(chapaResponse.checkoutUrl);
      await this.donationRepository.update(donation);

      return {
        checkoutUrl: chapaResponse.checkoutUrl,
        donationId: donation.getDonationID(),
        tx_ref: donation.getTransactionReference(),
      };
    } catch (error) {
      donation.fail(error instanceof Error ? error.message : 'Gateway error');
      await this.donationRepository.update(donation);

      this.logger.error(ctx, 'Failed to initialize Chapa transaction', {
        donationId: donation.getDonationID(),
        error: error instanceof Error ? error.message : 'Unknown error',
      });

      throw new BadRequestException('Failed to initialize payment gateway');
    }
  }

  public async handleChapaWebhook(
    ctx: RequestContext,
    payload: ChapaWebhookPayload,
    signature: string,
  ): Promise<void> {
    if (
      !this.chapaClient.verifySignature(
        payload as unknown as Record<string, unknown>,
        signature,
      )
    ) {
      throw new UnauthorizedException('Invalid Chapa signature');
    }

    const donation = await this.donationRepository.findByTransactionReference(
      payload.tx_ref,
    );
    if (!donation) {
      throw new NotFoundException(
        'Donation not found for transaction reference',
      );
    }

    if (payload.event === 'charge.success') {
      const verified = await this.chapaClient.verifyTransaction(payload.tx_ref);
      if (!verified) {
        donation.fail('Chapa verification failed');
        await this.donationRepository.update(donation);
        return;
      }

      donation.complete(payload.reference || payload.tx_ref);
      if (!donation.getReceiptToken()) {
        donation.issueReceiptToken();
      }
      await this.donationRepository.update(donation);

      await this.campaignService.applyCompletedDonation(
        donation.getCampaignID(),
        donation.getAmount(),
        donation.getCurrency(),
      );

      this.logger.log(ctx, 'Donation completed from Chapa webhook', {
        donationId: donation.getDonationID(),
        txRef: payload.tx_ref,
      });
      return;
    }

    donation.fail(payload.status || 'Webhook reported failure');
    await this.donationRepository.update(donation);
  }

  public async getDonationStatus(
    donationId: string,
  ): Promise<DonationStatusResponse> {
    const donation = await this.donationRepository.findById(donationId);
    if (!donation) {
      throw new NotFoundException('Donation not found');
    }

    return {
      donationId: donation.getDonationID(),
      status: donation.getStatus(),
      failureReason: donation.getFailureReason(),
    };
  }

  public async generateReceipt(
    donationId: string,
    accessToken?: string,
  ): Promise<{ filename: string; content: Buffer }> {
    const donation = await this.donationRepository.findById(donationId);
    if (!donation) {
      throw new NotFoundException('Donation not found');
    }

    if (donation.getStatus() !== DonationStatus.COMPLETED) {
      throw new BadRequestException(
        'Receipt is only available for completed donations',
      );
    }

    if (
      donation.getReceiptToken() &&
      donation.getReceiptToken() !== accessToken
    ) {
      throw new UnauthorizedException('Invalid receipt access token');
    }

    const donor = donation.getDonor().toPrimitives();
    const donorName = donor.isAnonymous ? 'Anonymous Donor' : donor.fullName;
    const pdf = buildSimplePdfReceipt([
      'Donation Receipt',
      `Donation ID: ${donation.getDonationID()}`,
      `Campaign ID: ${donation.getCampaignID()}`,
      `Amount: ${donation.getAmount()} ${donation.getCurrency()}`,
      `Transaction Ref: ${donation.getTransactionReference()}`,
      `Gateway Ref: ${donation.getGatewayReference() ?? 'N/A'}`,
      `Donor: ${donorName}`,
      `Issued At: ${new Date().toISOString()}`,
    ]);

    return {
      filename: `receipt-${donation.getDonationID()}.pdf`,
      content: pdf,
    };
  }
}
