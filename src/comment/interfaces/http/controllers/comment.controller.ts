import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  NotFoundException,
  Param,
  Post,
  Put,
  Query,
  UseInterceptors,
} from '@nestjs/common';
import {
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { v4 as uuidv4 } from 'uuid';

import {
  BaseApiErrorResponse,
  BaseApiResponse,
  SwaggerBaseApiResponse,
} from '../../../../shared/dtos/base-api-response.dto';
import { PaginationParamsDto } from '../../../../shared/dtos/pagination-params.dto';
import { AppLogger } from '../../../../shared/logger/logger.service';
import { ReqContext } from '../../../../shared/request-context/req-context.decorator';
import { RequestContext } from '../../../../shared/request-context/request-context.dto';
import { CommentOutputDto } from '../../../application/dto/comment-output.dto';
import { CreateCommentDto } from '../../../application/dto/create-comment.dto';
import { UpdateCommentDto } from '../../../application/dto/update-comment.dto';
import { CommentService } from '../../../application/services/comment.service';
import { Comment } from '../../../domain/entities/comment.entity';

export class CommentWithAuthorOutputDto {
  id: string;
  disasterId: string;
  authorId: string;
  content: string;
  attachments: string[];
  author: { id: number; username: string };
  createdAt: Date;
  updatedAt: Date;
}

@ApiTags('comments')
@Controller('comments')
export class CommentController {
  constructor(
    private readonly commentService: CommentService,
    private readonly logger: AppLogger,
  ) {
    this.logger.setContext(CommentController.name);
  }

  @UseInterceptors(ClassSerializerInterceptor)
  @Post()
  @ApiOperation({ summary: 'Create comment API' })
  @ApiBody({ type: CreateCommentDto })
  @ApiResponse({
    status: HttpStatus.CREATED,
    type: SwaggerBaseApiResponse(Comment),
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    type: BaseApiErrorResponse,
  })
  async create(
    @ReqContext() ctx: RequestContext,
    @Body() dto: CreateCommentDto,
  ): Promise<BaseApiResponse<Comment>> {
    this.logger.log(ctx, `${this.create.name} was called`);

    const comment = await this.commentService.create(
      ctx.user?.id.toString() || uuidv4(),
      dto,
    );
    return { data: comment, meta: {} };
  }

  @UseInterceptors(ClassSerializerInterceptor)
  @Get(':id')
  @ApiOperation({ summary: 'Get comment by id API' })
  @ApiParam({ name: 'id', type: String })
  @ApiResponse({
    status: HttpStatus.OK,
    type: SwaggerBaseApiResponse(Comment),
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    type: BaseApiErrorResponse,
  })
  async findOne(
    @ReqContext() ctx: RequestContext,
    @Param('id') id: string,
  ): Promise<BaseApiResponse<Comment>> {
    this.logger.log(ctx, `${this.findOne.name} was called`);

    const comment = await this.commentService.findOne(id);
    if (!comment) {
      throw new NotFoundException('Comment not found');
    }

    return { data: comment, meta: {} };
  }

  @UseInterceptors(ClassSerializerInterceptor)
  @Get()
  @ApiOperation({ summary: 'Get all comments paginated API' })
  @ApiResponse({
    status: HttpStatus.OK,
    type: SwaggerBaseApiResponse([CommentOutputDto]),
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    type: BaseApiErrorResponse,
  })
  async findAll(
    @ReqContext() ctx: RequestContext,
    @Query() query: PaginationParamsDto,
  ): Promise<BaseApiResponse<CommentOutputDto[]>> {
    this.logger.log(ctx, `${this.findAll.name} was called`);
    const { limit, offset } = query;
    const result = await this.commentService.findAllPaginated(limit, offset);
    return {
      data: result.data.map((comment) => this.mapToOutput(comment)),
      meta: { total: result.total },
    };
  }

  @UseInterceptors(ClassSerializerInterceptor)
  @Get('disaster/:disasterId')
  @ApiOperation({ summary: 'Get comments by disaster id paginated API' })
  @ApiParam({ name: 'disasterId', type: String })
  @ApiResponse({
    status: HttpStatus.OK,
    type: SwaggerBaseApiResponse([CommentOutputDto]),
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    type: BaseApiErrorResponse,
  })
  async findByDisasterId(
    @ReqContext() ctx: RequestContext,
    @Param('disasterId') disasterId: string,
    @Query() query: PaginationParamsDto,
  ): Promise<BaseApiResponse<CommentOutputDto[]>> {
    this.logger.log(ctx, `${this.findByDisasterId.name} was called`);
    const { limit, offset } = query;
    const result = await this.commentService.findByDisasterIdPaginated(
      disasterId,
      limit,
      offset,
    );
    return {
      data: result.data.map((comment) => this.mapToOutput(comment)),
      meta: { total: result.total },
    };
  }

  @UseInterceptors(ClassSerializerInterceptor)
  @Put(':id')
  @ApiOperation({ summary: 'Update comment API' })
  @ApiParam({ name: 'id', type: String })
  @ApiBody({ type: UpdateCommentDto })
  @ApiResponse({
    status: HttpStatus.OK,
    type: SwaggerBaseApiResponse(Comment),
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    type: BaseApiErrorResponse,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    type: BaseApiErrorResponse,
  })
  async update(
    @ReqContext() ctx: RequestContext,
    @Param('id') id: string,
    @Body() dto: UpdateCommentDto,
  ): Promise<BaseApiResponse<Comment>> {
    this.logger.log(ctx, `${this.update.name} was called`);
    const comment = await this.commentService.update(id, dto);
    return { data: comment, meta: {} };
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete comment API' })
  @ApiParam({ name: 'id', type: String })
  @ApiResponse({
    status: HttpStatus.NO_CONTENT,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    type: BaseApiErrorResponse,
  })
  async delete(
    @ReqContext() ctx: RequestContext,
    @Param('id') id: string,
  ): Promise<BaseApiResponse<void>> {
    this.logger.log(ctx, `${this.delete.name} was called`);
    await this.commentService.delete(id);
    return { data: undefined, meta: {} };
  }

  private mapToOutput(comment: Comment): CommentOutputDto {
    return {
      id: comment.getId(),
      disasterId: comment.getDisasterId(),
      authorId: comment.getAuthorId(),
      content: comment.getContent(),
      attachments: comment.getAttachments(),
      author: {
        id: parseInt(comment.getAuthorId(), 10) || 0,
        username: `user_${comment.getAuthorId().slice(0, 8)}`,
      },
      createdAt: comment.getCreatedAt(),
      updatedAt: comment.getUpdatedAt(),
    };
  }
}
