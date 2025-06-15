
import {ApiProperty,getSchemaPath} from '@nestjs/swagger'




export class CreateOrderDto {
  @ApiProperty({
  type: `string`,
  format: `date-time`,
})
deliveryDate?: Date;
}
