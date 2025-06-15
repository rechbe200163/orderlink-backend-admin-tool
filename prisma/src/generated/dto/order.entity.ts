import { OrderState } from '@prisma/client';
import { ApiProperty } from '@nestjs/swagger';
import { CustomerEntity } from './customer.entity';
import { OrderOnProducts } from './orderOnProducts.entity';
import { Invoice } from './invoice.entity';
import { RoutesOnOrders } from './routesOnOrders.entity';

export class Order {
  orderId: string;
  @ApiProperty({
    type: `integer`,
    format: `int32`,
  })
  customerReference: number;
  @ApiProperty({
    type: `string`,
    format: `date-time`,
  })
  orderDate: Date;
  @ApiProperty({
    type: `string`,
    format: `date-time`,
  })
  deliveryDate: Date | null;
  deleted: boolean;
  @ApiProperty({
    enum: OrderState,
  })
  orderState: OrderState;
  selfCollect: boolean;
  customer?: CustomerEntity;
  products?: OrderOnProducts[];
  invoice?: Invoice | null;
  route?: RoutesOnOrders[];
}
