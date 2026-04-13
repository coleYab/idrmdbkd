import {
  BadRequestException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';

import { AppLogger } from '../../../shared/logger/logger.service';
import { RequestContext } from '../../../shared/request-context/request-context.dto';
import { Donation } from '../../domain/entities/donation.entity';
import { DonationCampaign } from '../../domain/entities/donation-campaign.entity';
import { CampaignStatus } from '../../domain/enums/campaign-status.enum';
import { DonationStatus } from '../../domain/enums/donation-status.enum';
import { PaymentMethod } from '../../domain/enums/payment-method.enum';
import { DonationRepository } from '../../domain/repositories/donation.repository';
import { DonorInfo } from '../../domain/value-objects/donor-info.vo';
import { ChapaClient } from '../../infrastructure/services/chapa.client';
import { ChapaWebhookPayload } from '../dto/chapa-webhook-payload.dto';
import { InitializeDonationRequest } from '../dto/initialize-donation-request.dto';
import { DonationCampaignService } from './donation-campaign.service';
import { DonationTransactionService } from './donation-transaction.service';

describe('DonationTransactionService', () => {
  const donationRepository: jest.Mocked<DonationRepository> = {
    findById: jest.fn(),
    findByIdempotencyKey: jest.fn(),
    findByTransactionReference: jest.fn(),
    save: jest.fn(),
    update: jest.fn(),
  };

  const campaignService = {
    findCampaignById: jest.fn(),
    applyCompletedDonation: jest.fn(),
  } as unknown as jest.Mocked<DonationCampaignService>;

  const chapaClient = {
    initializeTransaction: jest.fn(),
    verifySignature: jest.fn(),
    verifyTransaction: jest.fn(),
  } as unknown as jest.Mocked<ChapaClient>;

  const logger = {
    setContext: jest.fn(),
    error: jest.fn(),
    log: jest.fn(),
  } as unknown as jest.Mocked<AppLogger>;

  let service: DonationTransactionService;

  const ctx = new RequestContext();

  beforeEach(() => {
    jest.resetAllMocks();
    service = new DonationTransactionService(
      donationRepository,
      campaignService,
      chapaClient,
      logger,
    );
  });

  describe('initializeDonation', () => {
    const baseDto: InitializeDonationRequest = {
      campaignID: 'camp-1',
      amount: 10,
      currency: 'ETB',
      donor: {
        fullName: 'John Doe',
        email: 'john@example.com',
        phoneNumber: '+251900000000',
        isAnonymous: false,
      },
    };

    it('requires idempotency key', async () => {
      await expect(
        service.initializeDonation(ctx, baseDto, ''),
      ).rejects.toBeInstanceOf(BadRequestException);
    });

    it('returns cached checkoutUrl when idempotency key matches', async () => {
      const cached = Donation.create(
        'don-1',
        baseDto.campaignID,
        'tx-1',
        baseDto.amount,
        baseDto.currency,
        PaymentMethod.CHAPA,
        new DonorInfo(
          baseDto.donor.fullName,
          baseDto.donor.email,
          baseDto.donor.phoneNumber,
          baseDto.donor.isAnonymous,
        ),
      );
      cached.initialize('idem-1');
      cached.markAsPending('https://checkout.test');

      donationRepository.findByIdempotencyKey.mockResolvedValue(cached);

      const resp = await service.initializeDonation(ctx, baseDto, 'idem-1');

      expect(resp).toEqual({
        checkoutUrl: 'https://checkout.test',
        donationId: cached.getDonationID(),
        tx_ref: cached.getTransactionReference(),
      });
      expect(donationRepository.save).not.toHaveBeenCalled();
    });

    it('rejects donation for non-active campaign', async () => {
      const campaign = DonationCampaign.create(
        'camp-1',
        'dis-1',
        100,
        'ETB',
        'desc',
      );

      campaignService.findCampaignById.mockResolvedValue(campaign);
      donationRepository.findByIdempotencyKey.mockResolvedValue(null);

      await expect(
        service.initializeDonation(ctx, baseDto, 'idem-1'),
      ).rejects.toBeInstanceOf(BadRequestException);
    });

    it('initializes transaction, persists donation and marks as pending', async () => {
      const campaign = DonationCampaign.create(
        'camp-1',
        'dis-1',
        100,
        'ETB',
        'desc',
      );
      campaign.activate();
      expect(campaign.getStatus()).toBe(CampaignStatus.ACTIVE);

      donationRepository.findByIdempotencyKey.mockResolvedValue(null);
      campaignService.findCampaignById.mockResolvedValue(campaign);
      chapaClient.initializeTransaction.mockResolvedValue({
        checkoutUrl: 'https://checkout.test',
      });

      const resp = await service.initializeDonation(ctx, baseDto, 'idem-1');

      expect(resp.checkoutUrl).toBe('https://checkout.test');
      expect(resp.donationId).toEqual(expect.any(String));
      expect(resp.tx_ref).toEqual(expect.any(String));

      expect(donationRepository.save).toHaveBeenCalledTimes(1);
      expect(donationRepository.update).toHaveBeenCalledTimes(1);
    });

    it('fails donation when gateway init throws', async () => {
      const campaign = DonationCampaign.create(
        'camp-1',
        'dis-1',
        100,
        'ETB',
        'desc',
      );
      campaign.activate();

      donationRepository.findByIdempotencyKey.mockResolvedValue(null);
      campaignService.findCampaignById.mockResolvedValue(campaign);
      chapaClient.initializeTransaction.mockRejectedValue(
        new Error('gateway down'),
      );

      await expect(
        service.initializeDonation(ctx, baseDto, 'idem-1'),
      ).rejects.toBeInstanceOf(BadRequestException);

      expect(donationRepository.update).toHaveBeenCalledTimes(1);
      expect(logger.error).toHaveBeenCalledTimes(1);
    });
  });

  describe('handleChapaWebhook', () => {
    const payload: ChapaWebhookPayload = {
      tx_ref: 'tx-1',
      event: 'charge.success',
      status: 'success',
      reference: 'gw-1',
    };

    it('rejects invalid signature', async () => {
      chapaClient.verifySignature.mockReturnValue(false);

      await expect(
        service.handleChapaWebhook(ctx, payload, 'sig'),
      ).rejects.toBeInstanceOf(UnauthorizedException);
    });

    it('throws NotFound when donation missing', async () => {
      chapaClient.verifySignature.mockReturnValue(true);
      donationRepository.findByTransactionReference.mockResolvedValue(null);

      await expect(
        service.handleChapaWebhook(ctx, payload, 'sig'),
      ).rejects.toBeInstanceOf(NotFoundException);
    });

    it('marks donation failed when verifyTransaction returns false', async () => {
      const donation = Donation.create(
        'don-1',
        'camp-1',
        payload.tx_ref,
        10,
        'ETB',
        PaymentMethod.CHAPA,
        new DonorInfo('John', 'john@example.com', undefined, false),
      );
      donation.initialize('idem-1');
      donation.markAsPending('https://checkout.test');

      chapaClient.verifySignature.mockReturnValue(true);
      donationRepository.findByTransactionReference.mockResolvedValue(donation);
      chapaClient.verifyTransaction.mockResolvedValue(false);

      await service.handleChapaWebhook(ctx, payload, 'sig');

      expect(donation.getStatus()).toBe(DonationStatus.FAILED);
      expect(donationRepository.update).toHaveBeenCalledTimes(1);
    });

    it('completes donation and applies campaign update on success', async () => {
      const donation = Donation.create(
        'don-1',
        'camp-1',
        payload.tx_ref,
        10,
        'ETB',
        PaymentMethod.CHAPA,
        new DonorInfo('John', 'john@example.com', undefined, false),
      );
      donation.initialize('idem-1');
      donation.markAsPending('https://checkout.test');

      chapaClient.verifySignature.mockReturnValue(true);
      donationRepository.findByTransactionReference.mockResolvedValue(donation);
      chapaClient.verifyTransaction.mockResolvedValue(true);

      await service.handleChapaWebhook(ctx, payload, 'sig');

      expect(donation.getStatus()).toBe(DonationStatus.COMPLETED);
      expect(donation.getReceiptToken()).toEqual(expect.any(String));
      expect(donationRepository.update).toHaveBeenCalledTimes(1);
      expect(campaignService.applyCompletedDonation).toHaveBeenCalledWith(
        donation.getCampaignID(),
        donation.getAmount(),
        donation.getCurrency(),
      );
    });

    it('marks donation failed for non-success event', async () => {
      const donation = Donation.create(
        'don-1',
        'camp-1',
        payload.tx_ref,
        10,
        'ETB',
        PaymentMethod.CHAPA,
        new DonorInfo('John', 'john@example.com', undefined, false),
      );
      donation.initialize('idem-1');

      chapaClient.verifySignature.mockReturnValue(true);
      donationRepository.findByTransactionReference.mockResolvedValue(donation);

      await service.handleChapaWebhook(
        ctx,
        { ...payload, event: 'charge.failed', status: 'failed' },
        'sig',
      );

      expect(donation.getStatus()).toBe(DonationStatus.FAILED);
      expect(donationRepository.update).toHaveBeenCalledTimes(1);
    });
  });

  describe('getDonationStatus', () => {
    it('throws when donation missing', async () => {
      donationRepository.findById.mockResolvedValue(null);
      await expect(service.getDonationStatus('missing')).rejects.toBeInstanceOf(
        NotFoundException,
      );
    });
  });

  describe('generateReceipt', () => {
    it('rejects when donation is not completed', async () => {
      const donation = Donation.create(
        'don-1',
        'camp-1',
        'tx-1',
        10,
        'ETB',
        PaymentMethod.CHAPA,
        new DonorInfo('John', 'john@example.com', undefined, false),
      );
      donation.initialize('idem-1');

      donationRepository.findById.mockResolvedValue(donation);

      await expect(service.generateReceipt('don-1')).rejects.toBeInstanceOf(
        BadRequestException,
      );
    });

    it('rejects when token does not match', async () => {
      const donation = Donation.create(
        'don-1',
        'camp-1',
        'tx-1',
        10,
        'ETB',
        PaymentMethod.CHAPA,
        new DonorInfo('John', 'john@example.com', undefined, false),
      );
      donation.initialize('idem-1');
      donation.markAsPending('https://checkout.test');
      donation.complete('gw-1');
      donation.issueReceiptToken();

      donationRepository.findById.mockResolvedValue(donation);

      await expect(
        service.generateReceipt('don-1', 'wrong-token'),
      ).rejects.toBeInstanceOf(UnauthorizedException);
    });

    it('generates a pdf buffer when completed and token matches (or token absent)', async () => {
      const donation = Donation.create(
        'don-1',
        'camp-1',
        'tx-1',
        10,
        'ETB',
        PaymentMethod.CHAPA,
        new DonorInfo('John', 'john@example.com', undefined, true),
      );
      donation.initialize('idem-1');
      donation.markAsPending('https://checkout.test');
      donation.complete('gw-1');
      donation.issueReceiptToken();

      donationRepository.findById.mockResolvedValue(donation);

      const receipt = await service.generateReceipt(
        'don-1',
        donation.getReceiptToken(),
      );

      expect(receipt.filename).toContain('receipt-');
      expect(receipt.filename).toContain('.pdf');
      expect(Buffer.isBuffer(receipt.content)).toBe(true);
      expect(receipt.content.length).toBeGreaterThan(0);
    });
  });
});
