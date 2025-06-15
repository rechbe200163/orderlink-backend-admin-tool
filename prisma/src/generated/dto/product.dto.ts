
import {ApiProperty} from '@nestjs/swagger'


export class ProductDto {
  productId: string ;
name: string ;
@ApiProperty({
  type: `integer`,
  format: `int32`,
})
price: number ;
description: string ;
@ApiProperty({
  type: `integer`,
  format: `int32`,
})
stock: number ;
imagePath: string  | null;
@ApiProperty({
  type: `string`,
  format: `date-time`,
})
createdAt: Date ;
@ApiProperty({
  type: `string`,
  format: `date-time`,
})
modifiedAt: Date  | null;
deleted: boolean ;
}
