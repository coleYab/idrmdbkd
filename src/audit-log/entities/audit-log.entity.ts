import { Column, CreateDateColumn, Entity, Index, PrimaryGeneratedColumn } from 'typeorm';

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

  @Column()
  performedBy: number;

  @CreateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  timestamp: Date;
}
