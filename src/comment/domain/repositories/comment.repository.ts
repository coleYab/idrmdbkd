import { Comment } from '../entities/comment.entity';

export const COMMENT_REPOSITORY = Symbol.for('CommentRepository');

export interface PaginatedResult {
  data: Comment[];
  total: number;
}

export interface CommentRepository {
  findById(id: string): Promise<Comment | null>;
  findAllPaginated(limit: number, offset: number): Promise<PaginatedResult>;
  findByDisasterIdPaginated(
    disasterId: string,
    limit: number,
    offset: number,
  ): Promise<PaginatedResult>;
  save(comment: Comment): Promise<void>;
  update(comment: Comment): Promise<void>;
  delete(id: string): Promise<void>;
}
