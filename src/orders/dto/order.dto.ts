import { Exclude, Expose } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { OrderState } from '@prisma/client';
import {
  IsBoolean,
  IsDateString,
  IsEnum,
  IsInt,
  IsUUID,
} from 'class-validator';

export class OrderDto {
  @Expose()
  @IsUUID()
  orderId: string;

  @Expose()
  @IsInt()
  customerReference: number;

  @ApiProperty({ type: String, format: 'date-time' })
  @Expose()
  @IsDateString()
  orderDate: Date;

  @ApiProperty({ type: String, format: 'date-time', required: false })
  @Expose()
  @IsDateString()
  deliveryDate: Date | null;

  @Expose()
  @IsBoolean()
  deleted: boolean;

  @ApiProperty({ enum: OrderState })
  @Expose()
  @IsEnum(OrderState)
  orderState: OrderState;

  @Expose()
  @IsBoolean()
  selfCollect: boolean;
}
