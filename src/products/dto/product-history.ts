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
import { CategoryDto } from 'src/categories/dto/category.dto';

export class ProductHistoryDto {
  @ApiProperty({
    type: String,
    format: 'uuid',
    description: 'Unique identifier for the product',
  })
  @Expose()
  @IsUUID()
  historyId: string;

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

  @Expose()
  createdAt: Date;

  @Expose()
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
    type: CategoryDto,

    description: 'Category of the product',
  })
  category: CategoryDto;

  @ApiProperty({
    type: Number,
    description: 'Version of the product history entry',
  })
  @Expose()
  @IsInt()
  version: number;
}
