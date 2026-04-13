import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryColumn,
  UpdateDateColumn,
} from 'typeorm';

import { DonationStatus } from '../../../domain/enums/donation-status.enum';
import { PaymentMethod } from '../../../domain/enums/payment-method.enum';

@Entity('donations')
export class DonationTypeOrmEntity {
  @PrimaryColumn('uuid')
  donationID: string;

  @Column('uuid')
  campaignID: string;

  @Column({ unique: true })
  transactionReference: string;

  @Column({ type: 'numeric', precision: 14, scale: 2 })
  amount: string;

  @Column({ length: 10 })
  currency: string;

  @Column({ type: 'enum', enum: PaymentMethod, default: PaymentMethod.CHAPA })
  paymentMethod: PaymentMethod;

  @Column({
    type: 'enum',
    enum: DonationStatus,
    default: DonationStatus.INITIALIZED,
  })
  status: DonationStatus;

  @Column({ type: 'text', nullable: true })
  failureReason?: string;

  @Column({ unique: true })
  idempotencyKey: string;

  @Column()
  donorFullName: string;

  @Column()
  donorEmail: string;

  @Column({ nullable: true })
  donorPhoneNumber?: string;

  @Column({ default: false })
  donorIsAnonymous: boolean;

  @Column({ type: 'text', nullable: true })
  checkoutUrl?: string;

  @Column({ type: 'text', nullable: true })
  gatewayReference?: string;

  @Column({ type: 'text', nullable: true })
  receiptToken?: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
