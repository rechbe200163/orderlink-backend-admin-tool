
import {ApiProperty} from '@nestjs/swagger'




export class UpdateOrderDto {
  @ApiProperty({
  type: `string`,
  format: `date-time`,
})
deliveryDate?: Date;
}
