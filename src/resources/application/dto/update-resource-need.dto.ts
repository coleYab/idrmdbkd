import { IsEnum, IsNotEmpty, IsNumber, IsOptional, Min } from 'class-validator';

export enum ResourceNeedStatusDto {
  PENDING = 'pending',
  IN_PROGRESS = 'in_progress',
  SATISFIED = 'satisfied',
}

export class UpdateResourceNeedStatusDto {
  @IsNotEmpty()
  @IsEnum(ResourceNeedStatusDto)
  status: ResourceNeedStatusDto;
}
