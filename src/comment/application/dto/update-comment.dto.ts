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

export class UpdateCommentDto {
  @ApiProperty({
    description: 'Updated comment text/content',
    maxLength: 2000,
    example: 'Updated comment content.',
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
