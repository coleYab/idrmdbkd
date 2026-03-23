import { IsEnum, IsNotEmpty, IsString, MaxLength } from 'class-validator';

import { IncidentStatus } from '../../../shared/enums/incident.enums';

export class UpdateDisasterDto {
  @IsNotEmpty()
  @IsString()
  @MaxLength(100)
  name: string;

  @IsNotEmpty()
  @IsString()
  @MaxLength(500)
  description: string;
}

export class UpdateIncidentStatus {
  @IsNotEmpty()
  @IsEnum(IncidentStatus)
  status: IncidentStatus;
}
