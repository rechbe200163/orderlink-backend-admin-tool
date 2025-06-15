
import {ApiProperty} from '@nestjs/swagger'


export class OrderOnProductsDto {
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
