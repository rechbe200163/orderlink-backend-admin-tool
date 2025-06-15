
import {OrderState} from '@prisma/client'
import {ApiProperty} from '@nestjs/swagger'


export class OrderDto {
  orderId: string ;
@ApiProperty({
  type: `string`,
  format: `date-time`,
})
orderDate: Date ;
@ApiProperty({
  type: `string`,
  format: `date-time`,
})
deliveryDate: Date  | null;
deleted: boolean ;
@ApiProperty({
  enum: OrderState,
})
orderState: OrderState ;
selfCollect: boolean ;
}
