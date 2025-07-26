import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsDateString,
  IsInt,
  IsOptional,
  ValidateNested,
} from 'class-validator';
import { CreateOrderProductDto } from './create-order-product.dto';

export class CreateOrderDto {
  @ApiProperty({ type: Number, example: 123 })
  @Type(() => Number)
  @IsInt()
  customerReference: number;

  @ApiProperty({ type: String, format: 'date-time', required: false })
  @IsOptional()
  @IsDateString()
  deliveryDate?: Date;

  @ApiProperty({ type: Boolean, required: false })
  @IsOptional()
  @IsBoolean()
  selfCollect?: boolean;

  @ApiProperty({ type: [CreateOrderProductDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateOrderProductDto)
  products: CreateOrderProductDto[];
}
