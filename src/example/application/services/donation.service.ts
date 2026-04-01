import { Inject, Injectable } from '@nestjs/common';

import { Donation } from '../../domain/entities/donation.entity';
import {
  DONATION_REPOSITORY,
  DonationRepository,
} from '../../domain/repositories/donation.repository';

@Injectable()
export class DonationService {
  constructor(
    @Inject(DONATION_REPOSITORY)
    private readonly donationRepository: DonationRepository,
  ) {}

  public async findAll(): Promise<Donation[]> {
    return this.donationRepository.findAll();
  }

  public async findOne(id: string): Promise<Donation | null> {
    return this.donationRepository.findById(id);
  }

  public async delete(id: string): Promise<void> {
    await this.donationRepository.delete(id);
  }
}
