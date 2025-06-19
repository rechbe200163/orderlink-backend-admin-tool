import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsOptional, IsPositive, IsString, Min } from 'class-validator';

export class UpdateProductDto {
  @ApiProperty({ type: String, required: false })
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
  @Type(() => Number) // ✅ force type conversion
  @IsInt()
  @IsPositive()
  @Min(1)
  @IsOptional()
  price?: number;

  @ApiProperty({ type: String, required: false })
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
  @Type(() => Number) // ✅ force type conversion
  @IsInt()
  @Min(0)
  @IsOptional()
  stock?: number;

  @ApiProperty({ type: 'string', format: 'binary', required: false })
  @IsOptional()
  image?: any;
}
