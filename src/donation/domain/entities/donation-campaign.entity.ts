import { AggregateRoot } from '@nestjs/cqrs';

import { CampaignStatus } from '../enums/campaign-status.enum';
import { CampaignGoalMetEvent } from '../events/campaign-goal-met.event';

export class DonationCampaign extends AggregateRoot {
  constructor(
    private readonly campaignID: string,
    private readonly disasterID: string,
    private readonly goalAmount: number,
    private currentAmount: number,
    private readonly currency: string,
    private status: CampaignStatus,
    private donationCount: number,
    private readonly description: string,
    private readonly createdAt: Date,
    private updatedAt: Date,
    private closedAt?: Date,
  ) {
    super();
  }

  public static create(
    campaignID: string,
    disasterID: string,
    goalAmount: number,
    currency: string,
    description: string,
  ): DonationCampaign {
    if (goalAmount <= 0) {
      throw new Error('Campaign goal amount must be greater than 0');
    }

    const now = new Date();
    return new DonationCampaign(
      campaignID,
      disasterID,
      goalAmount,
      0,
      currency,
      CampaignStatus.DRAFT,
      0,
      description,
      now,
      now,
      undefined,
    );
  }

  public activate(): void {
    if (this.goalAmount <= 0) {
      throw new Error('Cannot activate campaign without a valid goal');
    }

    if (this.status === CampaignStatus.CLOSED) {
      throw new Error('Closed campaign cannot be activated');
    }

    this.status = CampaignStatus.ACTIVE;
    this.updatedAt = new Date();
  }

  public pause(): void {
    if (this.status !== CampaignStatus.ACTIVE) {
      throw new Error('Only active campaigns can be paused');
    }

    this.status = CampaignStatus.PAUSED;
    this.updatedAt = new Date();
  }

  public close(): void {
    if (this.status === CampaignStatus.CLOSED) {
      return;
    }

    this.status = CampaignStatus.CLOSED;
    this.closedAt = new Date();
    this.updatedAt = new Date();
  }

  public addFunds(amount: number, currency: string): void {
    if (this.status !== CampaignStatus.ACTIVE) {
      throw new Error('Only active campaigns can receive funds');
    }

    if (amount <= 0) {
      throw new Error('Donation amount must be greater than 0');
    }

    if (currency !== this.currency) {
      throw new Error('Currency mismatch for campaign');
    }

    this.currentAmount += amount;
    this.donationCount += 1;
    this.updatedAt = new Date();

    if (this.currentAmount >= this.goalAmount) {
      this.apply(
        new CampaignGoalMetEvent(
          this.campaignID,
          this.goalAmount,
          this.currentAmount,
        ),
      );
    }
  }

  public getCampaignID(): string {
    return this.campaignID;
  }

  public getDisasterID(): string {
    return this.disasterID;
  }

  public getGoalAmount(): number {
    return this.goalAmount;
  }

  public getCurrentAmount(): number {
    return this.currentAmount;
  }

  public getCurrency(): string {
    return this.currency;
  }

  public getStatus(): CampaignStatus {
    return this.status;
  }

  public getDonationCount(): number {
    return this.donationCount;
  }

  public getDescription(): string {
    return this.description;
  }

  public getCreatedAt(): Date {
    return this.createdAt;
  }

  public getUpdatedAt(): Date {
    return this.updatedAt;
  }

  public getClosedAt(): Date | undefined {
    return this.closedAt;
  }

  public getProgressPercentage(): number {
    return Number(((this.currentAmount / this.goalAmount) * 100).toFixed(2));
  }
}
