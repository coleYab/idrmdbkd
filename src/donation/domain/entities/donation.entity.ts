import { AggregateRoot } from '@nestjs/cqrs';
import { v4 as uuidv4 } from 'uuid';

import { DonationStatus } from '../enums/donation-status.enum';
import { PaymentMethod } from '../enums/payment-method.enum';
import { DonationCompletedEvent } from '../events/donation-completed.event';
import { DonorInfo } from '../value-objects/donor-info.vo';

export class Donation extends AggregateRoot {
  constructor(
    private readonly donationID: string,
    private readonly campaignID: string,
    private transactionReference: string,
    private readonly amount: number,
    private readonly currency: string,
    private readonly paymentMethod: PaymentMethod,
    private status: DonationStatus,
    private failureReason: string | undefined,
    private idempotencyKey: string,
    private readonly donor: DonorInfo,
    private checkoutUrl: string | undefined,
    private gatewayReference: string | undefined,
    private receiptToken: string | undefined,
    private readonly createdAt: Date,
    private updatedAt: Date,
  ) {
    super();
  }

  public static create(
    donationID: string,
    campaignID: string,
    transactionReference: string,
    amount: number,
    currency: string,
    paymentMethod: PaymentMethod,
    donor: DonorInfo,
  ): Donation {
    if (amount <= 0) {
      throw new Error('Donation amount must be greater than 0');
    }

    const now = new Date();
    return new Donation(
      donationID,
      campaignID,
      transactionReference,
      amount,
      currency,
      paymentMethod,
      DonationStatus.INITIALIZED,
      undefined,
      '',
      donor,
      undefined,
      undefined,
      undefined,
      now,
      now,
    );
  }

  public initialize(idempotencyKey: string): void {
    if (!idempotencyKey) {
      throw new Error('Idempotency key is required');
    }

    this.idempotencyKey = idempotencyKey;
    this.status = DonationStatus.INITIALIZED;
    this.updatedAt = new Date();
  }

  public markAsPending(checkoutUrl: string): void {
    if (this.status !== DonationStatus.INITIALIZED) {
      throw new Error('Only initialized donation can be marked as pending');
    }

    this.status = DonationStatus.PENDING_GATEWAY;
    this.checkoutUrl = checkoutUrl;
    this.updatedAt = new Date();
  }

  public complete(gatewayReference: string): void {
    if (this.status === DonationStatus.COMPLETED) {
      return;
    }

    if (
      this.status !== DonationStatus.PENDING_GATEWAY &&
      this.status !== DonationStatus.INITIALIZED
    ) {
      throw new Error('Invalid donation state transition to completed');
    }

    this.status = DonationStatus.COMPLETED;
    this.failureReason = undefined;
    this.gatewayReference = gatewayReference;
    this.updatedAt = new Date();
    this.apply(
      new DonationCompletedEvent(
        this.donationID,
        this.campaignID,
        this.amount,
        this.currency,
      ),
    );
  }

  public fail(reason: string): void {
    this.status = DonationStatus.FAILED;
    this.failureReason = reason;
    this.updatedAt = new Date();
  }

  public issueReceiptToken(): void {
    this.receiptToken = uuidv4();
    this.updatedAt = new Date();
  }

  public getDonationID(): string {
    return this.donationID;
  }

  public getCampaignID(): string {
    return this.campaignID;
  }

  public getTransactionReference(): string {
    return this.transactionReference;
  }

  public setTransactionReference(reference: string): void {
    this.transactionReference = reference;
    this.updatedAt = new Date();
  }

  public getAmount(): number {
    return this.amount;
  }

  public getCurrency(): string {
    return this.currency;
  }

  public getPaymentMethod(): PaymentMethod {
    return this.paymentMethod;
  }

  public getStatus(): DonationStatus {
    return this.status;
  }

  public getFailureReason(): string | undefined {
    return this.failureReason;
  }

  public getIdempotencyKey(): string {
    return this.idempotencyKey;
  }

  public getDonor(): DonorInfo {
    return this.donor;
  }

  public getCheckoutUrl(): string | undefined {
    return this.checkoutUrl;
  }

  public getGatewayReference(): string | undefined {
    return this.gatewayReference;
  }

  public getReceiptToken(): string | undefined {
    return this.receiptToken;
  }

  public getCreatedAt(): Date {
    return this.createdAt;
  }

  public getUpdatedAt(): Date {
    return this.updatedAt;
  }
}
