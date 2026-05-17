import {
  IsNumber,
  IsOptional,
  Min,
  IsNotEmpty,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

class LocationDto {
  @IsNumber()
  latitude: number;

  @IsNumber()
  longitude: number;
}

export class UpdateInventoryItemDto {
  @IsOptional()
  @ValidateNested()
  @Type(() => LocationDto)
  location?: LocationDto;
}

export class UpdateInventoryItemStockDto {
  @IsNotEmpty()
  @IsNumber()
  quantity: number;
}
