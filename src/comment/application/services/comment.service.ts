import { Inject, Injectable } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';

import { Comment } from '../../domain/entities/comment.entity';
import {
  COMMENT_REPOSITORY,
  CommentRepository,
  PaginatedResult,
} from '../../domain/repositories/comment.repository';
import { CreateCommentDto } from '../dto/create-comment.dto';
import { UpdateCommentDto } from '../dto/update-comment.dto';

@Injectable()
export class CommentService {
  constructor(
    @Inject(COMMENT_REPOSITORY)
    private readonly commentRepository: CommentRepository,
  ) {}

  async create(authorId: string, dto: CreateCommentDto): Promise<Comment> {
    const comment = Comment.create(
      uuidv4(),
      dto.disasterId,
      authorId,
      dto.content,
      dto.attachments || [],
      new Date(),
      new Date(),
    );

    await this.commentRepository.save(comment);
    return comment;
  }

  async findOne(id: string): Promise<Comment | null> {
    return this.commentRepository.findById(id);
  }

  async findAllPaginated(
    limit: number,
    offset: number,
  ): Promise<PaginatedResult> {
    return this.commentRepository.findAllPaginated(limit, offset);
  }

  async findByDisasterIdPaginated(
    disasterId: string,
    limit: number,
    offset: number,
  ): Promise<PaginatedResult> {
    return this.commentRepository.findByDisasterIdPaginated(
      disasterId,
      limit,
      offset,
    );
  }

  async update(id: string, dto: UpdateCommentDto): Promise<Comment> {
    const comment = await this.commentRepository.findById(id);
    if (!comment) {
      throw new Error('Comment not found');
    }

    comment.update(dto.content, dto.attachments || comment.getAttachments());
    await this.commentRepository.update(comment);
    return comment;
  }

  async delete(id: string): Promise<void> {
    await this.commentRepository.delete(id);
  }
}
