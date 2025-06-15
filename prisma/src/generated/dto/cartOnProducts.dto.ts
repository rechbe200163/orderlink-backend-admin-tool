
import {ApiProperty} from '@nestjs/swagger'


export class CartOnProductsDto {
  @ApiProperty({
  type: `integer`,
  format: `int32`,
})
quantity: number ;
}
