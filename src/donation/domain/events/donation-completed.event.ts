export class DonationCompletedEvent {
  constructor(
    public readonly donationId: string,
    public readonly campaignId: string,
    public readonly amount: number,
    public readonly currency: string,
  ) {}
}
