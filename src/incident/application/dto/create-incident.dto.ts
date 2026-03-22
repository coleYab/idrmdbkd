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
  @IsNotEmpty()
  @IsString()
  @MaxLength(100)
  title: string;

  @IsNotEmpty()
  @IsString()
  @MaxLength(1000) // Increased limit for detailed disaster descriptions
  description: string;

  @IsNotEmpty()
  @IsEnum(IncidentType)
  incidentType: IncidentType;

  @IsNotEmpty()
  @IsEnum(IncidentSeverityLevel)
  severity: IncidentSeverityLevel;

  @IsNotEmpty()
  @IsString()
  @MaxLength(255)
  location: string;

  @IsArray()
  @IsString({ each: true })
  @IsUrl({}, { each: true })
  @ArrayMaxSize(10)
  attachments: string[];

  @IsNotEmpty()
  @IsInt()
  @Min(0)
  @Type(() => Number)
  affectedPopulationCount: number;

  @IsNotEmpty()
  @IsBoolean()
  requiresUrgentMedical: boolean;

  @IsArray()
  @IsString({ each: true })
  @MaxLength(100, { each: true })
  infrastructureDamage: string[];
}
