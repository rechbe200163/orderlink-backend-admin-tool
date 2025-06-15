import { ApiProperty } from '@nestjs/swagger';
import { CustomerEntity } from './customer.entity';
import { CartOnProducts } from './cartOnProducts.entity';

export class Cart {
  cartId: string;
  @ApiProperty({
    type: `integer`,
    format: `int32`,
  })
  customerReference: number | null;
  customer?: CustomerEntity | null;
  products?: CartOnProducts[];
}
