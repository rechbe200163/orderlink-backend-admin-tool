
import {ApiProperty} from '@nestjs/swagger'
import {Cart} from './cart.entity'
import {Product} from './product.entity'


export class CartOnProducts {
  cartId: string ;
cart?: Cart ;
productId: string ;
product?: Product ;
@ApiProperty({
  type: `integer`,
  format: `int32`,
})
quantity: number ;
}
