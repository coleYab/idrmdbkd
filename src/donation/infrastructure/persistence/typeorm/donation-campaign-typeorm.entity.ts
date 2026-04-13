import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryColumn,
  UpdateDateColumn,
} from 'typeorm';

import { CampaignStatus } from '../../../domain/enums/campaign-status.enum';

@Entity('donation_campaigns')
export class DonationCampaignTypeOrmEntity {
  @PrimaryColumn('uuid')
  campaignID: string;

  @Column('uuid')
  disasterID: string;

  @Column({ type: 'numeric', precision: 14, scale: 2 })
  goalAmount: string;

  @Column({ type: 'numeric', precision: 14, scale: 2, default: 0 })
  currentAmount: string;

  @Column({ length: 10, default: 'ETB' })
  currency: string;

  @Column({ type: 'enum', enum: CampaignStatus, default: CampaignStatus.DRAFT })
  status: CampaignStatus;

  @Column({ type: 'int', default: 0 })
  donationCount: number;

  @Column({ type: 'text' })
  description: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  closedAt?: Date;
}