import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('audit_logs')
@Index(['actionType'])
@Index(['performedBy'])
@Index(['resourceName'])
@Index(['timestamp'])
export class AuditLog {
  @PrimaryGeneratedColumn()
  logID: number;

  @Column({ length: 50 })
  actionType: string;

  @Column({ length: 200 })
  resourceName: string;

  @Column({ type: 'text' })
  details: string;

  @Column({ type: 'varchar', nullable: true, length: 100 })
  performedBy: string | null;

  @CreateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  timestamp: Date;
}
