import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('notification_push_tokens')
export class NotificationPushToken {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 255, unique: true })
  key: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  email: string | null;

  @Column({ length: 255 })
  pushToken: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}