import { ApiProperty } from '@nestjs/swagger';
import { Exclude, Expose } from 'class-transformer';
import {
  IsBoolean,
  IsInt,
  IsPositive,
  IsString,
  IsUrl,
  IsUUID,
  Min,
} from 'class-validator';

export class ProductDto {
  @ApiProperty({
    type: String,
    format: 'uuid',
    description: 'Unique identifier for the product',
  })
  @Expose()
  @IsUUID()
  productId: string;

  @ApiProperty({
    type: String,
    description: 'Name of the product',
  })
  @Expose()
  @IsString()
  name: string;

  @ApiProperty({
    type: Number,
    description: 'Price of the product',
  })
  @Expose()
  @IsInt()
  @IsPositive()
  @Min(1)
  price: number;

  @ApiProperty({
    type: String,
    description: 'Description of the product',
  })
  @Expose()
  @IsString()
  description: string;

  @ApiProperty({
    type: Number,
    description: 'Stock quantity of the product',
  })
  @Expose()
  @IsInt()
  @IsPositive()
  @Min(0)
  stock: number;

  @ApiProperty({
    type: String,
    format: 'url',
    description: 'URL of the product image',
    required: false,
  })
  @Expose()
  @IsUrl()
  imagePath: string | null;

  @Exclude()
  createdAt: Date;

  @Exclude()
  modifiedAt: Date | null;

  @ApiProperty({
    type: Boolean,
    description: 'Indicates if the product is deleted',
    default: false,
  })
  @Expose()
  @IsBoolean()
  deleted: boolean;

  @ApiProperty({
    type: String,
    format: 'uuid',
    description: 'Category ID of the product',
  })
  @Expose()
  @IsUUID()
  categoryId: string;
}
