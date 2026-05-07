import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsString, MaxLength } from 'class-validator';

import { IncidentStatus } from '../../../shared/enums/incident.enums';

export class UpdateIncidentDto {
  @ApiProperty({
    description: 'Updated incident title',
    example: 'Flooding escalated in Nyando',
    maxLength: 100,
  })
  @IsNotEmpty()
  @IsString()
  @MaxLength(100)
  name: string;

  @ApiProperty({
    description: 'Updated incident description',
    example: 'Water levels increased overnight and evacuation is ongoing.',
    maxLength: 500,
  })
  @IsNotEmpty()
  @IsString()
  @MaxLength(500)
  description: string;
}

export class UpdateIncidentStatus {
  @ApiProperty({
    description: 'New status to apply to the incident',
    enum: IncidentStatus,
    example: IncidentStatus.VERIFIED,
  })
  @IsNotEmpty()
  @IsEnum(IncidentStatus)
  status: IncidentStatus;
}
