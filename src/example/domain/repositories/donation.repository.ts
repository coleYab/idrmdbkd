import { Donation } from '../entities/donation.entity';

export const DONATION_REPOSITORY = Symbol.for('DonationRepository');
export interface DonationRepository {
  findById(id: string): Promise<Donation | null>;
  findAll(): Promise<Donation[]>;
  save(disaster: Donation): Promise<void>;
  update(disaster: Donation): Promise<void>;
  delete(id: string): Promise<void>;
}
