
import {ApiProperty,getSchemaPath} from '@nestjs/swagger'




export class CreateInvoiceDto {
  @ApiProperty({
  type: `integer`,
  format: `int32`,
})
invoiceAmount: number;
@ApiProperty({
  type: `string`,
  format: `date-time`,
  default: `now`,
})
paymentDate?: Date;
pdfUrl: string;
}
