import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

import { DonationCampaignTypeOrmEntity } from '../../../../donation/infrastructure/persistence/typeorm/donation-campaign-typeorm.entity';

@Entity('donations')
export class DonationTypeOrmEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  title: string;

  @Column({ type: 'text' })
  description: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => DonationCampaignTypeOrmEntity, { nullable: true })
  @Column({ type: 'uuid', nullable: true })
  campaignId?: string;
}
