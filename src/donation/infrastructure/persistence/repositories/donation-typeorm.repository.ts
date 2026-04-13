import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Donation } from '../../../domain/entities/donation.entity';
import { DonationRepository } from '../../../domain/repositories/donation.repository';
import { DonorInfo } from '../../../domain/value-objects/donor-info.vo';
import { DonationTypeOrmEntity } from '../typeorm/donation-typeorm.entity';

@Injectable()
export class DonationTypeOrmRepository implements DonationRepository {
  constructor(
    @InjectRepository(DonationTypeOrmEntity)
    private readonly repository: Repository<DonationTypeOrmEntity>,
  ) {}

  async findById(id: string): Promise<Donation | null> {
    const entity = await this.repository.findOne({ where: { donationID: id } });
    if (!entity) return null;

    return this.toDomain(entity);
  }

  async findByIdempotencyKey(idempotencyKey: string): Promise<Donation | null> {
    const entity = await this.repository.findOne({ where: { idempotencyKey } });
    return entity ? this.toDomain(entity) : null;
  }

  async findByTransactionReference(txRef: string): Promise<Donation | null> {
    const entity = await this.repository.findOne({
      where: { transactionReference: txRef },
    });
    return entity ? this.toDomain(entity) : null;
  }

  async save(donation: Donation): Promise<void> {
    const entity = this.toPersistence(donation);
    await this.repository.save(entity);
  }

  async update(donation: Donation): Promise<void> {
    const entity = this.toPersistence(donation);
    await this.repository.save(entity);
  }

  private toPersistence(donation: Donation): DonationTypeOrmEntity {
    const donor = donation.getDonor().toPrimitives();
    const entity = new DonationTypeOrmEntity();
    entity.donationID = donation.getDonationID();
    entity.campaignID = donation.getCampaignID();
    entity.transactionReference = donation.getTransactionReference();
    entity.amount = donation.getAmount().toFixed(2);
    entity.currency = donation.getCurrency();
    entity.paymentMethod = donation.getPaymentMethod();
    entity.status = donation.getStatus();
    entity.failureReason = donation.getFailureReason();
    entity.idempotencyKey = donation.getIdempotencyKey();
    entity.donorFullName = donor.fullName;
    entity.donorEmail = donor.email;
    entity.donorPhoneNumber = donor.phoneNumber;
    entity.donorIsAnonymous = donor.isAnonymous;
    entity.checkoutUrl = donation.getCheckoutUrl();
    entity.gatewayReference = donation.getGatewayReference();
    entity.receiptToken = donation.getReceiptToken();
    entity.createdAt = donation.getCreatedAt();
    entity.updatedAt = donation.getUpdatedAt();
    return entity;
  }

  private toDomain(entity: DonationTypeOrmEntity): Donation {
    return new Donation(
      entity.donationID,
      entity.campaignID,
      entity.transactionReference,
      Number(entity.amount),
      entity.currency,
      entity.paymentMethod,
      entity.status,
      entity.failureReason,
      entity.idempotencyKey,
      new DonorInfo(
        entity.donorFullName,
        entity.donorEmail,
        entity.donorPhoneNumber,
        entity.donorIsAnonymous,
      ),
      entity.checkoutUrl,
      entity.gatewayReference,
      entity.receiptToken,
      entity.createdAt,
      entity.updatedAt,
    );
  }
}
