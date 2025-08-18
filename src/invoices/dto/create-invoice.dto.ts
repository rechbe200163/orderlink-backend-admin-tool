import { ApiProperty } from '@nestjs/swagger';
import {
  IsUUID,
  IsInt,
  IsOptional,
  IsDateString,
  IsString,
} from 'class-validator';

export class CreateInvoiceDto {
  @ApiProperty({ type: String, format: 'uuid' })
  @IsUUID()
  orderId: string;

  @ApiProperty({ type: Number })
  @IsInt()
  invoiceAmount: number;

  @ApiProperty({ type: String, format: 'date-time', required: false })
  @IsOptional()
  @IsDateString()
  paymentDate?: Date;

  @ApiProperty({ type: String })
  @IsString()
  pdfUrl: string;
}
