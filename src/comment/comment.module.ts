import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { SharedModule } from '../shared/shared.module';
import { CommentService } from './application/services/comment.service';
import { COMMENT_REPOSITORY } from './domain/repositories/comment.repository';
import { CommentTypeOrmEntity } from './infrastructure/persistence/typeorm/comment-typeorm.entity';
import { CommentTypeOrmRepository } from './infrastructure/persistence/repositories/comment-typeorm.repository';
import { CommentController } from './interfaces/http/controllers/comment.controller';

@Module({
  imports: [SharedModule, TypeOrmModule.forFeature([CommentTypeOrmEntity])],
  controllers: [CommentController],
  providers: [
    CommentService,
    {
      provide: COMMENT_REPOSITORY,
      useClass: CommentTypeOrmRepository,
    },
  ],
  exports: [COMMENT_REPOSITORY],
})
export class CommentModule {}
