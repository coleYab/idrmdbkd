import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class CreateDonationDto {
  @IsNotEmpty()
  @IsString()
  @MaxLength(100)
  title: string;

  @IsNotEmpty()
  @IsString()
  @MaxLength(1000)
  description: string;
}
