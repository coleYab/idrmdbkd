import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  ArrayMaxSize,
  IsArray,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUrl,
  MaxLength,
} from 'class-validator';

export class CreateCommentDto {
  @ApiProperty({
    description: 'Disaster ID that this comment belongs to',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @IsNotEmpty()
  @IsString()
  disasterId: string;

  @ApiProperty({
    description: 'Comment text/content',
    maxLength: 2000,
    example: 'This is a comment about the disaster.',
  })
  @IsNotEmpty()
  @IsString()
  @MaxLength(2000)
  content: string;

  @ApiPropertyOptional({
    description: 'Optional list of attachment URLs',
    type: [String],
    maxItems: 10,
    example: ['https://example.com/image.jpg'],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @IsUrl({}, { each: true })
  @ArrayMaxSize(10)
  attachments?: string[];
}
