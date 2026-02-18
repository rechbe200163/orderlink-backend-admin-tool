import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsInt } from 'class-validator';
import { OrderState } from 'generated/prisma/client';

export class OrderStateCountDto {
  @ApiProperty({ enum: OrderState })
  @IsEnum(OrderState)
  orderState: OrderState;

  @ApiProperty()
  @IsInt()
  _count: number;
}
