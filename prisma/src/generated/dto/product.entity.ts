
import {ApiProperty} from '@nestjs/swagger'
import {CategoriesOnProducts} from './categoriesOnProducts.entity'
import {CartOnProducts} from './cartOnProducts.entity'
import {OrderOnProducts} from './orderOnProducts.entity'


export class Product {
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
categories?: CategoriesOnProducts[] ;
carts?: CartOnProducts[] ;
orders?: OrderOnProducts[] ;
}
