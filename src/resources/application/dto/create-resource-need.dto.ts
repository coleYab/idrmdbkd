import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsUUID,
  Min,
} from 'class-validator';

export enum ResourceNeedPriorityDto {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
}

export enum ResourceNeedStatusDto {
  PENDING = 'pending',
  IN_PROGRESS = 'in_progress',
  SATISFIED = 'satisfied',
}

export class CreateResourceNeedDto {
  @IsNotEmpty()
  @IsUUID()
  resourceID: string;

  @IsNotEmpty()
  @IsNumber()
  @Min(1)
  quantityRequired: number;

  @IsNotEmpty()
  @IsEnum(ResourceNeedPriorityDto)
  priority: ResourceNeedPriorityDto;

  @IsOptional()
  @IsUUID()
  incidentID?: string;
}
