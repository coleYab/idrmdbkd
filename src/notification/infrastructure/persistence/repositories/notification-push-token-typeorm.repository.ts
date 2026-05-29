import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { NotificationPushToken } from '../../../domain/entities/notification-push-token.entity';
import { NotificationPushTokenRepository } from '../../../domain/repositories/notification-push-token.repository';

@Injectable()
export class NotificationPushTokenTypeOrmRepository implements NotificationPushTokenRepository {
  constructor(
    @InjectRepository(NotificationPushToken)
    private readonly repository: Repository<NotificationPushToken>,
  ) {}

  async findAll(): Promise<NotificationPushToken[]> {
    return this.repository.find();
  }

  async findByKey(key: string): Promise<NotificationPushToken | null> {
    return this.repository.findOne({ where: { key } });
  }

  async findByPushToken(
    pushToken: string,
  ): Promise<NotificationPushToken | null> {
    return this.repository.findOne({ where: { pushToken } });
  }

  async save(token: NotificationPushToken): Promise<NotificationPushToken> {
    return this.repository.save(token);
  }
}
