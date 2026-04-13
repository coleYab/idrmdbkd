import { CampaignStatus } from '../enums/campaign-status.enum';
import { DonationCampaign } from './donation-campaign.entity';

describe('DonationCampaign', () => {
  it('throws when creating campaign with non-positive goal amount', () => {
    expect(() =>
      DonationCampaign.create('camp-1', 'dis-1', 0, 'ETB', 'desc'),
    ).toThrow('Campaign goal amount must be greater than 0');
  });

  it('activates a draft campaign', () => {
    const campaign = DonationCampaign.create(
      'camp-1',
      'dis-1',
      100,
      'ETB',
      'desc',
    );

    campaign.activate();

    expect(campaign.getStatus()).toBe(CampaignStatus.ACTIVE);
  });

  it('cannot pause unless ACTIVE', () => {
    const campaign = DonationCampaign.create(
      'camp-1',
      'dis-1',
      100,
      'ETB',
      'desc',
    );

    expect(() => campaign.pause()).toThrow(
      'Only active campaigns can be paused',
    );

    campaign.activate();
    campaign.pause();
    expect(campaign.getStatus()).toBe(CampaignStatus.PAUSED);
  });

  it('close is idempotent', () => {
    const campaign = DonationCampaign.create(
      'camp-1',
      'dis-1',
      100,
      'ETB',
      'desc',
    );

    campaign.close();
    const closedAt1 = campaign.getClosedAt();

    campaign.close();
    const closedAt2 = campaign.getClosedAt();

    expect(campaign.getStatus()).toBe(CampaignStatus.CLOSED);
    expect(closedAt1).toBeInstanceOf(Date);
    expect(closedAt2).toBeInstanceOf(Date);
  });

  it('adds funds only when ACTIVE and currency matches', () => {
    const campaign = DonationCampaign.create(
      'camp-1',
      'dis-1',
      100,
      'ETB',
      'desc',
    );

    expect(() => campaign.addFunds(10, 'ETB')).toThrow(
      'Only active campaigns can receive funds',
    );

    campaign.activate();

    expect(() => campaign.addFunds(0, 'ETB')).toThrow(
      'Donation amount must be greater than 0',
    );

    expect(() => campaign.addFunds(10, 'USD')).toThrow(
      'Currency mismatch for campaign',
    );

    campaign.addFunds(10, 'ETB');
    expect(campaign.getCurrentAmount()).toBe(10);
    expect(campaign.getDonationCount()).toBe(1);
  });

  it('progress percentage is rounded to 2 decimals', () => {
    const campaign = DonationCampaign.create(
      'camp-1',
      'dis-1',
      300,
      'ETB',
      'desc',
    );

    campaign.activate();
    campaign.addFunds(100, 'ETB');

    expect(campaign.getProgressPercentage()).toBe(33.33);
  });
});
