import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class UpdateDonationDto {
  @IsNotEmpty()
  @IsString()
  @MaxLength(100)
  name: string;

  @IsNotEmpty()
  @IsString()
  @MaxLength(500)
  description: string;
}
