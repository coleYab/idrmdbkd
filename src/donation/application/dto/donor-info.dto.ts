import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';

export class DonorInfoDto {
  @ApiProperty({ example: 'Abebe Kebede' })
  @IsString()
  @IsNotEmpty()
  fullName: string;

  @ApiProperty({ example: 'abebe@example.com' })
  @IsEmail()
  email: string;

  @ApiPropertyOptional({ example: '+251911223344' })
  @IsOptional()
  @IsString()
  phoneNumber?: string;

  @ApiProperty({ example: false })
  @IsBoolean()
  isAnonymous: boolean;
}
