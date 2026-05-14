import {
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
  Min,
  IsNotEmpty,
} from 'class-validator';

export class UpdateInventoryItemDto {
  @IsOptional()
  @IsString()
  @MaxLength(255)
  location?: string;
}

export class UpdateInventoryItemStockDto {
  @IsNotEmpty()
  @IsNumber()
  quantity: number;
}
