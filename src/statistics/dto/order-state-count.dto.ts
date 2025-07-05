import { ApiProperty } from '@nestjs/swagger';
import { OrderState } from '@prisma/client';
import { IsEnum, IsInt } from 'class-validator';

export class OrderStateCountDto {
  @ApiProperty({ enum: OrderState })
  @IsEnum(OrderState)
  orderState: OrderState;

  @ApiProperty()
  @IsInt()
  _count: number;
}
