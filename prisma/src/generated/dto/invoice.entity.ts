
import {ApiProperty} from '@nestjs/swagger'
import {Order} from './order.entity'


export class Invoice {
  invoiceId: string ;
orderId: string ;
@ApiProperty({
  type: `integer`,
  format: `int32`,
})
invoiceAmount: number ;
@ApiProperty({
  type: `string`,
  format: `date-time`,
})
paymentDate: Date  | null;
pdfUrl: string ;
deleted: boolean ;
order?: Order ;
}
