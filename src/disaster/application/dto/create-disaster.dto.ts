import { applyDecorators } from '@nestjs/common';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

import {
  DisasterSeverityLevel,
  DisasterStatus,
  DisasterType,
} from '../../../shared/enums/disaster.enums';

export class CreateDisasterDto {
  @ApiProperty({
    description: 'Disaster title',
    maxLength: 100,
    example: 'Flood in Downtown Area',
  })
  @IsNotEmpty()
  @IsString()
  @MaxLength(100)
  title: string;

  @ApiProperty({
    description: 'Disaster description',
    maxLength: 1000,
    example: 'Heavy rainfall caused flooding in multiple streets.',
  })
  @IsNotEmpty()
  @IsString()
  @MaxLength(1000)
  description: string;

  @ApiProperty({
    description: 'Disaster type',
    enum: DisasterType,
    example: DisasterType.FLOOD,
  })
  @IsNotEmpty()
  @IsEnum(DisasterType)
  type: DisasterType;

  @ApiProperty({
    description: 'Disaster status',
    enum: DisasterStatus,
    example: DisasterStatus.PENDING,
  })
  @IsNotEmpty()
  @IsEnum(DisasterStatus)
  status: DisasterStatus;

  @ApiProperty({
    description: 'Disaster severity',
    enum: DisasterSeverityLevel,
    example: DisasterSeverityLevel.HIGH,
  })
  @IsNotEmpty()
  @IsEnum(DisasterSeverityLevel)
  severity: DisasterSeverityLevel;

  @ApiProperty({
    description: 'Location of the disaster',
    example: 'Downtown, Springfield',
  })
  @IsNotEmpty()
  @IsString()
  location: string;

  @ApiProperty({
    description: 'Total affected population',
    example: 1200,
  })
  @IsNotEmpty()
  @IsNumber()
  totalAffectedPopulation: number;

  @ApiPropertyOptional({
    description: 'Whether urgent medical assistance is required',
    default: false,
    example: false,
  })
  @IsOptional()
  @IsBoolean()
  @Default(false)
  requiresUrgentMedical: boolean;

  @ApiProperty({
    description: 'List of damaged infrastructures',
    type: [String],
    example: ['Bridge', 'Road', 'Power line'],
  })
  @IsArray()
  @IsString({ each: true })
  infrastructureDamage: string[];

  @ApiProperty({
    description: 'Attachment identifiers (e.g. file URLs/keys)',
    type: [String],
    example: ['https://example.com/image1.jpg'],
  })
  @IsArray()
  @IsString({ each: true })
  attachments: string[];

  @ApiPropertyOptional({
    description: 'Estimated economic loss',
    default: 0,
    example: 1000000,
  })
  @IsOptional()
  @IsNumber()
  @Default(0)
  estimatedEconomicLoss?: number;

  @ApiPropertyOptional({
    description: 'Budget allocated for response and recovery',
    default: 0,
    example: 250000,
  })
  @IsOptional()
  @IsNumber()
  @Default(0)
  budgetAllocated?: number;

  @ApiPropertyOptional({
    description: 'Incident IDs linked to this disaster for traceability',
    type: [String],
    example: ['5b6b2a5d-4e3b-4f4f-9b5a-7b0d86a1f8c1'],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  linkedIncidentIds?: string[];
}

function Default(defaultValue: any) {
  return applyDecorators(
    Transform(({ value }) => (value === undefined ? defaultValue : value)),
  );
}
