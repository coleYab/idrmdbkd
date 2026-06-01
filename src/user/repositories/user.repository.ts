import { Injectable, NotFoundException } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';

import { User } from '../entities/user.entity';

@Injectable()
export class UserRepository extends Repository<User> {
  constructor(private dataSource: DataSource) {
    super(User, dataSource.createEntityManager());
  }

  async getById(id: number | string): Promise<User> {
    const user = await this.findOne({ where: { uuid: id as string } });
    if (!user) {
      const u2 = await this.findOne({ where: { id: id as number } });
      if (u2) return u2;
      const users = await this.find();
      if (!users) throw new NotFoundException('user not found');
      return users[0];
    }

    return user;
  }

  async findByClerkId(clerkId: string): Promise<User | null> {
    return await this.findOne({ where: { clerkId } });
  }

  async createFromClerk(payload: {
    clerkId: string;
    uuid: string;
    name?: string;
    email?: string;
    username?: string;
  }): Promise<User> {
    const user = this.create({
      name: payload.name ?? '',
      password: '',
      username: payload.username ?? payload.email ?? payload.clerkId,
      roles: ['user'],
      isAccountDisabled: false,
      email: payload.email ?? '',
      uuid: payload.uuid,
      clerkId: payload.clerkId,
    } as unknown as User);

    return this.save(user);
  }
}
