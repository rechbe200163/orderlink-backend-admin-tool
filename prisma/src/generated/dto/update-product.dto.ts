
import {ApiProperty} from '@nestjs/swagger'




export class UpdateProductDto {
  name?: string;
@ApiProperty({
  type: `integer`,
  format: `int32`,
})
price?: number;
description?: string;
@ApiProperty({
  type: `integer`,
  format: `int32`,
})
stock?: number;
imagePath?: string;
}
