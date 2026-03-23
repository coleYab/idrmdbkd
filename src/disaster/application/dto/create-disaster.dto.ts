import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class CreateDisasterDto {
  @IsNotEmpty()
  @IsString()
  @MaxLength(100)
  title: string;

  @IsNotEmpty()
  @IsString()
  @MaxLength(1000) // Increased limit for detailed disaster descriptions
  description: string;
}
