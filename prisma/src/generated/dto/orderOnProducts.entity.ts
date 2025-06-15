
import {ApiProperty} from '@nestjs/swagger'
import {Order} from './order.entity'
import {Product} from './product.entity'


export class OrderOnProducts {
  orderId: string ;
order?: Order ;
productId: string ;
product?: Product ;
@ApiProperty({
  type: `string`,
  format: `date-time`,
})
orderDate: Date ;
@ApiProperty({
  type: `integer`,
  format: `int32`,
})
productAmount: number ;
}
