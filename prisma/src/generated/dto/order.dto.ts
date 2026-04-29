import { ApiProperty } from '@nestjs/swagger';
import { OrderState } from 'generated/client';

export class OrderDto {
  orderId: string;
  @ApiProperty({
    type: `string`,
    format: `date-time`,
  })
  orderDate: Date;
  @ApiProperty({
    type: `string`,
    format: `date-time`,
  })
  deliveryDate: Date | null;
  deleted: boolean;
  @ApiProperty({
    enum: OrderState,
  })
  orderState: OrderState;
  selfCollect: boolean;
}
