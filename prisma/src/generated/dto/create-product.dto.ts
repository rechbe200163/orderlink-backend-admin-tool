
import {ApiProperty,getSchemaPath} from '@nestjs/swagger'




export class CreateProductDto {
  name: string;
@ApiProperty({
  type: `integer`,
  format: `int32`,
})
price: number;
description: string;
@ApiProperty({
  type: `integer`,
  format: `int32`,
})
stock: number;
imagePath?: string;
}
