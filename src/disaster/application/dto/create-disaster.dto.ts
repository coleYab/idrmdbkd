import { applyDecorators } from '@nestjs/common';
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
  @IsNotEmpty()
  @IsString()
  @MaxLength(100)
  title: string;

  @IsNotEmpty()
  @IsString()
  @MaxLength(1000)
  description: string;

  @IsNotEmpty()
  @IsEnum(DisasterType)
  type: DisasterType;

  @IsNotEmpty()
  @IsEnum(DisasterStatus)
  status: DisasterStatus;

  @IsNotEmpty()
  @IsEnum(DisasterSeverityLevel)
  severity: DisasterSeverityLevel;

  @IsNotEmpty()
  @IsString()
  location: string;

  @IsNotEmpty()
  @IsNumber()
  totalAffectedPopulation: number;

  @IsOptional()
  @IsBoolean()
  @Default(false)
  requiresUrgentMedical: boolean;

  @IsArray()
  @IsString({ each: true })
  infrastructureDamage: string[];

  @IsArray()
  @IsString({ each: true })
  attachments: string[];

  @IsOptional()
  @IsNumber()
  @Default(0)
  estimatedEconomicLoss?: number;

  @IsOptional()
  @IsNumber()
  @Default(0)
  budgetAllocated?: number;

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
