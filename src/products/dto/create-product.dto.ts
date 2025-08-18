import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer'; // ✅ import this
import {
  IsInt,
  IsOptional,
  IsPositive,
  IsString,
  IsUUID,
  Min,
} from 'class-validator';

export class CreateProductDto {
  @ApiProperty({ type: String, required: true })
  @IsString()
  name: string;

  @ApiProperty({
    type: Number,
    format: 'int32',
    required: true,
    description: 'Price of the product in cents',
    example: 1999,
  })
  @Type(() => Number) // ✅ force type conversion
  @IsInt()
  @IsPositive()
  @Min(1)
  price: number;

  @ApiProperty({ type: String })
  @IsString()
  description: string;

  @ApiProperty({
    type: Number,
    format: 'int32',
    required: true,
    description: 'Stock quantity of the product',
    example: 100,
  })
  @Type(() => Number) // ✅ force type conversion
  @IsInt()
  @Min(0)
  stock: number;

  @ApiProperty({
    type: String,
    required: true,
    description: 'Category ID of the product',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID()
  categoryId: string;

  @ApiProperty({ type: 'string', format: 'binary' })
  productImage: string;
}
