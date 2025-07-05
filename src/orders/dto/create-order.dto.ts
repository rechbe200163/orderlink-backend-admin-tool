import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsBoolean, IsDateString, IsInt, IsOptional } from 'class-validator';

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
}
