import { Donation } from '../entities/donation.entity';

export const DONATION_REPOSITORY = Symbol.for('DonationRepository');
export interface DonationRepository {
  findById(id: string): Promise<Donation | null>;
  findByIdempotencyKey(idempotencyKey: string): Promise<Donation | null>;
  findByTransactionReference(txRef: string): Promise<Donation | null>;
  save(donation: Donation): Promise<void>;
  update(donation: Donation): Promise<void>;
}
