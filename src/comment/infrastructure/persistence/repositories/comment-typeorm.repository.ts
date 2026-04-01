import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Comment } from '../../../domain/entities/comment.entity';
import {
  CommentRepository,
  PaginatedResult,
} from '../../../domain/repositories/comment.repository';
import { CommentTypeOrmEntity } from '../typeorm/comment-typeorm.entity';

@Injectable()
export class CommentTypeOrmRepository implements CommentRepository {
  constructor(
    @InjectRepository(CommentTypeOrmEntity)
    private readonly repository: Repository<CommentTypeOrmEntity>,
  ) {}

  async findById(id: string): Promise<Comment | null> {
    const entity = await this.repository.findOne({ where: { id } });
    if (!entity) return null;

    return new Comment(
      entity.id,
      entity.disasterId,
      entity.authorId,
      entity.content,
      entity.attachments,
      entity.createdAt,
      entity.updatedAt,
    );
  }

  async findAllPaginated(
    limit: number,
    offset: number,
  ): Promise<PaginatedResult> {
    const [entities, total] = await this.repository.findAndCount({
      order: { createdAt: 'DESC' },
      take: limit,
      skip: offset,
    });

    const data = entities.map(
      (entity) =>
        new Comment(
          entity.id,
          entity.disasterId,
          entity.authorId,
          entity.content,
          entity.attachments,
          entity.createdAt,
          entity.updatedAt,
        ),
    );

    return { data, total };
  }

  async findByDisasterIdPaginated(
    disasterId: string,
    limit: number,
    offset: number,
  ): Promise<PaginatedResult> {
    const [entities, total] = await this.repository.findAndCount({
      where: { disasterId },
      order: { createdAt: 'DESC' },
      take: limit,
      skip: offset,
    });

    const data = entities.map(
      (entity) =>
        new Comment(
          entity.id,
          entity.disasterId,
          entity.authorId,
          entity.content,
          entity.attachments,
          entity.createdAt,
          entity.updatedAt,
        ),
    );

    return { data, total };
  }

  async save(comment: Comment): Promise<void> {
    const entity = new CommentTypeOrmEntity();
    entity.id = comment.getId();
    entity.disasterId = comment.getDisasterId();
    entity.authorId = comment.getAuthorId();
    entity.content = comment.getContent();
    entity.attachments = comment.getAttachments();
    entity.createdAt = comment.getCreatedAt();
    entity.updatedAt = comment.getUpdatedAt();
    await this.repository.save(entity);
  }

  async update(comment: Comment): Promise<void> {
    const entity = await this.repository.findOne({
      where: { id: comment.getId() },
    });
    if (!entity) throw new Error('Comment not found');
    entity.content = comment.getContent();
    entity.attachments = comment.getAttachments();
    entity.updatedAt = comment.getUpdatedAt();
    await this.repository.save(entity);
  }

  async delete(id: string): Promise<void> {
    await this.repository.delete(id);
  }
}
