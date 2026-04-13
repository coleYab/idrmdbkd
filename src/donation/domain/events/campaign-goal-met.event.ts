export class CampaignGoalMetEvent {
  constructor(
    public readonly campaignId: string,
    public readonly goalAmount: number,
    public readonly currentAmount: number,
  ) {}
}
