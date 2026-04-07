import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

import { DisasterTypeOrmEntity } from '../../../../disaster/infrastructure/persistence/typeorm/disaster-typeorm.entity';

@Entity('comments')
@Index(['disasterId'])
export class CommentTypeOrmEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => DisasterTypeOrmEntity, (disaster) => disaster.comments, {
    onDelete: 'CASCADE',
  })
  @Column()
  disasterId: string;

  @Column()
  authorId: string;

  @Column({ type: 'text' })
  content: string;

  @Column('text', { array: true, default: [] })
  attachments: string[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
