
import {ApiProperty} from '@nestjs/swagger'


export class InvoiceDto {
  invoiceId: string ;
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
}
