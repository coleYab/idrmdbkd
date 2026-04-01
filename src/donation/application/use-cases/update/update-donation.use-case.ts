import { Inject, Injectable } from '@nestjs/common';

import { Donation } from '../../../domain/entities/donation.entity';
import {
  DONATION_REPOSITORY,
  DonationRepository,
} from '../../../domain/repositories/donation.repository';
import { UpdateDonationDto } from '../../dto/update-donation.dto';

@Injectable()
export class UpdateDonationUseCase {
  constructor(
    @Inject(DONATION_REPOSITORY)
    private readonly donationRepository: DonationRepository,
  ) {}

  async execute(id: string, dto: UpdateDonationDto): Promise<Donation> {
    const donation = await this.donationRepository.findById(id);
    if (!donation) {
      throw new Error('Donation not found');
    }

    donation.update(dto.name, dto.description);

    await this.donationRepository.update(donation);

    return donation;
  }
}
