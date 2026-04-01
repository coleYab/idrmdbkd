import { Inject, Injectable } from '@nestjs/common';

import { Donation } from '../../../domain/entities/donation.entity';
import {
  DONATION_REPOSITORY,
  DonationRepository,
} from '../../../domain/repositories/donation.repository';
import { CreateDonationDto } from '../../dto/create-donation.dto';

@Injectable()
export class CreateDonationCampagnUseCase {
  constructor(
    @Inject(DONATION_REPOSITORY)
    private readonly donationRepository: DonationRepository,
  ) {}

  async execute(userId: string, dto: CreateDonationDto): Promise<Donation> {
    const donation = Donation.create(
      userId,
      dto.title,
      dto.description,
      new Date(),
      new Date(),
    );

    await this.donationRepository.save(donation);
    return donation;
  }
}
