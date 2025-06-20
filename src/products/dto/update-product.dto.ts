import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsInt,
  IsOptional,
  IsPositive,
  IsString,
  IsUUID,
  Min,
} from 'class-validator';
import {
  ToOptionalNumber,
  ToOptionalString,
  ToOptionalUUID,
} from 'lib/utils/transformers';

export class UpdateProductDto {
  @ApiProperty({ type: String, required: false })
  @ToOptionalString()
  @IsString()
  @IsOptional()
  name?: string;

  @ApiProperty({
    type: Number,
    format: 'int32',
    required: false,
    description: 'Price of the product in cents',
    example: 1999,
  })
  @Type(() => Number)
  @ToOptionalNumber()
  @IsInt()
  @IsPositive()
  @Min(1)
  @IsOptional()
  price?: number;

  @ApiProperty({ type: String, required: false })
  @ToOptionalString()
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({
    type: Number,
    format: 'int32',
    required: false,
    description: 'Stock quantity of the product',
    example: 100,
  })
  @Type(() => Number)
  @ToOptionalNumber()
  @IsInt()
  @Min(0)
  @IsOptional()
  stock?: number;

  @ApiProperty({
    type: String,
    required: false,
    description: 'Category ID of the product',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ToOptionalUUID()
  @IsUUID()
  @IsOptional()
  categoryId?: string;

  @ApiProperty({ type: 'string', format: 'binary', required: false })
  @IsOptional()
  productImage?: any;
}
