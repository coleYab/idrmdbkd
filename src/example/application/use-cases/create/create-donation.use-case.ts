import { Inject, Injectable } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';

import { Donation } from '../../../domain/entities/donation.entity';
import {
  DONATION_REPOSITORY,
  DonationRepository,
} from '../../../domain/repositories/donation.repository';
import { CreateDonationDto } from '../../dto/create-donation.dto';

@Injectable()
export class CreateDonationUseCase {
  constructor(
    @Inject(DONATION_REPOSITORY)
    private readonly donationRepository: DonationRepository,
  ) {}

  async execute(userId: string, dto: CreateDonationDto): Promise<Donation> {
    const donation = Donation.create(
      uuidv4(),
      dto.title,
      dto.description,
      new Date(),
      new Date(),
    );

    await this.donationRepository.save(donation);
    return donation;
  }
}
