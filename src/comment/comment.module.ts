import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AuditLogModule } from '../audit-log/audit-log.module';
import { SharedModule } from '../shared/shared.module';
import { CommentService } from './application/services/comment.service';
import { COMMENT_REPOSITORY } from './domain/repositories/comment.repository';
import { CommentTypeOrmRepository } from './infrastructure/persistence/repositories/comment-typeorm.repository';
import { CommentTypeOrmEntity } from './infrastructure/persistence/typeorm/comment-typeorm.entity';
import { CommentController } from './interfaces/http/controllers/comment.controller';

@Module({
  imports: [SharedModule, AuditLogModule, TypeOrmModule.forFeature([CommentTypeOrmEntity])],
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
