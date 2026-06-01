import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  Unique,
  UpdateDateColumn,
} from 'typeorm';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Unique('uuid', ['uuid'])
  @Column({ length: 36 })
  uuid: string;

  @Unique('clerkId', ['clerkId'])
  @Column({ length: 255, nullable: true })
  clerkId: string;

  @Column({ length: 255 })
  name: string;

  @Column()
  password: string;

  @Unique('username', ['username'])
  @Column({ length: 255 })
  username: string;

  @Column('simple-array')
  roles: string[];

  @Column()
  isAccountDisabled: boolean;

  @Unique('email', ['email'])
  @Column({ length: 255 })
  email: string;

  @CreateDateColumn({ name: 'createdAt', nullable: true })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updatedAt', nullable: true })
  updatedAt: Date;
}
