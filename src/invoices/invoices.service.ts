import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import PDFDocument from 'pdfkit';
import { InjectMinio } from 'src/minio/minio.decorator';
import * as Minio from 'minio';
import { OrdersRepository } from 'src/orders/orders.repository';
import { EventPayloads } from 'src/event-emitter/interface/event-types.interface';
import { InvoicesRepository } from './invoices.repository';
import { CreateInvoiceDto } from './dto/create-invoice.dto';
import { UpdateInvoiceDto } from './dto/update-invoice.dto';
import { PagingResultDto } from 'lib/dto/genericPagingResultDto';
import { InvoiceDto } from 'prisma/src/generated/dto/invoice.dto';

@Injectable()
export class InvoicesService {
  constructor(
    private readonly invoicesRepository: InvoicesRepository,
    private readonly ordersRepository: OrdersRepository,
    @InjectMinio() private readonly minio: Minio.Client,
  ) {}

  create(createInvoiceDto: CreateInvoiceDto): Promise<InvoiceDto> {
    return this.invoicesRepository.create(createInvoiceDto);
  }

  findAll(limit = 10, page = 1): Promise<PagingResultDto<InvoiceDto>> {
    return this.invoicesRepository.findAll(limit, page);
  }

  findById(id: string): Promise<InvoiceDto> {
    return this.invoicesRepository.findById(id);
  }

  update(id: string, updateInvoiceDto: UpdateInvoiceDto): Promise<InvoiceDto> {
    return this.invoicesRepository.update(id, updateInvoiceDto);
  }

  @OnEvent('order.created')
  async handleOrderCreated(event: EventPayloads['order.created']) {
    const order = await this.ordersRepository.findDetailedById(event.orderId);
    const invoiceAmount = order.products.reduce(
      (sum, p) => sum + p.product.price * p.productAmount,
      0,
    );

    const doc = new PDFDocument();
    const buffers: Buffer[] = [];
    doc.text(`Invoice for order ${order.orderId}`);
    doc.text(
      `Customer: ${order.customer.firstName ?? ''} ${order.customer.lastName}`,
    );
    doc.text(`Amount: ${(invoiceAmount / 100).toFixed(2)} EUR`);
    doc.on('data', (b) => buffers.push(b));
    await new Promise<void>((resolve) => {
      doc.end();
      doc.on('end', () => resolve());
    });

    const pdf = Buffer.concat(buffers);
    const filename = `${order.orderId}.pdf`;
    await this.minio.putObject('invoice', filename, pdf);

    await this.invoicesRepository.create({
      orderId: order.orderId,
      invoiceAmount,
      paymentDate: new Date(),
      pdfUrl: filename,
    });
  }
}
