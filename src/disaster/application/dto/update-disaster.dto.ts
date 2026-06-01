import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsString, MaxLength } from 'class-validator';

import { DisasterStatus } from '../../../shared/enums/disaster.enums';
import { IncidentStatus } from '../../../shared/enums/incident.enums';

export class UpdateDisasterDto {
  @ApiProperty({
    description: 'Disaster name/title',
    maxLength: 100,
    example: 'Flood in Downtown Area',
  })
  @IsNotEmpty()
  @IsString()
  @MaxLength(100)
  name: string;

  @ApiProperty({
    description: 'Disaster description',
    maxLength: 500,
    example: 'Updated description of the disaster.',
  })
  @IsNotEmpty()
  @IsString()
  @MaxLength(500)
  description: string;
}

export class UpdateIncidentStatus {
  @ApiProperty({
    description: 'New incident status',
    enum: IncidentStatus,
    example: IncidentStatus.VERIFIED,
  })
  @IsNotEmpty()
  @IsEnum(IncidentStatus)
  status: IncidentStatus;
}

export class UpdateDisasterStatus {
  @ApiProperty({
    description: 'New disaster status',
    enum: DisasterStatus,
    example: DisasterStatus.RESOLVED,
  })
  @IsNotEmpty()
  @IsEnum(DisasterStatus)
  status: DisasterStatus;
}
