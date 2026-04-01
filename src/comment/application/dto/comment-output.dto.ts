import { ApiProperty } from '@nestjs/swagger';

export class CommentAuthorDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 'john_doe' })
  username: string;
}

export class CommentOutputDto {
  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440000' })
  id: string;

  @ApiProperty({ example: 'disaster-uuid' })
  disasterId: string;

  @ApiProperty({ example: 'user-uuid' })
  authorId: string;

  @ApiProperty({ example: 'This is a comment about the disaster.' })
  content: string;

  @ApiProperty({ example: ['https://example.com/image.jpg'], required: false })
  attachments: string[];

  @ApiProperty()
  author: CommentAuthorDto;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}
