import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  ArrayMaxSize,
  IsArray,
  IsBoolean,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsString,
  IsUrl,
  MaxLength,
  Min,
} from 'class-validator';

import {
  IncidentSeverityLevel,
  IncidentType,
} from '../../../shared/enums/incident.enums';

export class ReportIncidentDto {
  @ApiProperty({
    description: 'Short title describing the incident',
    example: 'Flooding in Nyando sub-county',
    maxLength: 100,
  })
  @IsNotEmpty()
  @IsString()
  @MaxLength(100)
  title: string;

  @ApiProperty({
    description: 'Detailed description of what happened',
    example: 'Heavy rainfall has caused river overflow and displacement.',
    maxLength: 1000,
  })
  @IsNotEmpty()
  @IsString()
  @MaxLength(1000) // Increased limit for detailed disaster descriptions
  description: string;

  @ApiProperty({
    description: 'Type/category of the incident',
    enum: IncidentType,
    example: IncidentType.FLOOD,
  })
  @IsNotEmpty()
  @IsEnum(IncidentType)
  incidentType: IncidentType;

  @ApiProperty({
    description: 'Reported severity level of the incident',
    enum: IncidentSeverityLevel,
    example: IncidentSeverityLevel.HIGH,
  })
  @IsNotEmpty()
  @IsEnum(IncidentSeverityLevel)
  severity: IncidentSeverityLevel;

  @ApiProperty({
    description: 'Location where the incident occurred',
    example: 'Kisumu County, Nyando',
    maxLength: 255,
  })
  @IsNotEmpty()
  @IsString()
  @MaxLength(255)
  location: string;

  @ApiProperty({
    description: 'Evidence links related to the incident',
    type: [String],
    maxItems: 10,
    example: ['https://example.com/evidence/photo-1.jpg'],
  })
  @IsArray()
  @IsString({ each: true })
  @IsUrl({}, { each: true })
  @ArrayMaxSize(10)
  attachments: string[];

  @ApiProperty({
    description: 'Estimated number of people affected',
    minimum: 0,
    example: 120,
  })
  @IsNotEmpty()
  @IsInt()
  @Min(0)
  @Type(() => Number)
  affectedPopulationCount: number;

  @ApiProperty({
    description: 'Whether urgent medical support is required',
    example: true,
  })
  @IsNotEmpty()
  @IsBoolean()
  requiresUrgentMedical: boolean;

  @ApiProperty({
    description: 'List of damaged infrastructure elements',
    type: [String],
    example: ['Bridge', 'Health center roof'],
  })
  @IsArray()
  @IsString({ each: true })
  @MaxLength(100, { each: true })
  infrastructureDamage: string[];
}
