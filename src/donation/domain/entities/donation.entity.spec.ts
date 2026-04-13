import { Donation } from './donation.entity';
import { DonationStatus } from '../enums/donation-status.enum';
import { PaymentMethod } from '../enums/payment-method.enum';
import { DonorInfo } from '../value-objects/donor-info.vo';

describe('Donation', () => {
  const donor = new DonorInfo(
    'John Doe',
    'john@example.com',
    '+251900000000',
    false,
  );

  it('throws when creating donation with non-positive amount', () => {
    expect(() =>
      Donation.create(
        'don-1',
        'camp-1',
        'tx-1',
        0,
        'ETB',
        PaymentMethod.CHAPA,
        donor,
      ),
    ).toThrow('Donation amount must be greater than 0');
  });

  it('initializes donation with idempotency key', () => {
    const donation = Donation.create(
      'don-1',
      'camp-1',
      'tx-1',
      10,
      'ETB',
      PaymentMethod.CHAPA,
      donor,
    );

    donation.initialize('idem-1');

    expect(donation.getIdempotencyKey()).toBe('idem-1');
    expect(donation.getStatus()).toBe(DonationStatus.INITIALIZED);
  });

  it('throws when initializing without idempotency key', () => {
    const donation = Donation.create(
      'don-1',
      'camp-1',
      'tx-1',
      10,
      'ETB',
      PaymentMethod.CHAPA,
      donor,
    );

    expect(() => donation.initialize('')).toThrow(
      'Idempotency key is required',
    );
  });

  it('marks donation as pending from INITIALIZED only', () => {
    const donation = Donation.create(
      'don-1',
      'camp-1',
      'tx-1',
      10,
      'ETB',
      PaymentMethod.CHAPA,
      donor,
    );

    donation.markAsPending('https://example.com/checkout');

    expect(donation.getStatus()).toBe(DonationStatus.PENDING_GATEWAY);
    expect(donation.getCheckoutUrl()).toBe('https://example.com/checkout');

    expect(() =>
      donation.markAsPending('https://example.com/checkout-2'),
    ).toThrow('Only initialized donation can be marked as pending');
  });

  it('completes donation from pending/initialized and is idempotent when already completed', () => {
    const donation = Donation.create(
      'don-1',
      'camp-1',
      'tx-1',
      10,
      'ETB',
      PaymentMethod.CHAPA,
      donor,
    );

    donation.markAsPending('https://example.com/checkout');
    donation.complete('gw-1');

    expect(donation.getStatus()).toBe(DonationStatus.COMPLETED);
    expect(donation.getGatewayReference()).toBe('gw-1');
    expect(donation.getFailureReason()).toBeUndefined();

    donation.complete('gw-2');

    expect(donation.getGatewayReference()).toBe('gw-1');
    expect(donation.getStatus()).toBe(DonationStatus.COMPLETED);
  });

  it('throws on invalid transition to completed', () => {
    const donation = Donation.create(
      'don-1',
      'camp-1',
      'tx-1',
      10,
      'ETB',
      PaymentMethod.CHAPA,
      donor,
    );

    donation.fail('failed');

    expect(() => donation.complete('gw-1')).toThrow(
      'Invalid donation state transition to completed',
    );
  });

  it('issues receipt token', () => {
    const donation = Donation.create(
      'don-1',
      'camp-1',
      'tx-1',
      10,
      'ETB',
      PaymentMethod.CHAPA,
      donor,
    );

    expect(donation.getReceiptToken()).toBeUndefined();

    donation.issueReceiptToken();

    expect(donation.getReceiptToken()).toEqual(expect.any(String));
  });
});
