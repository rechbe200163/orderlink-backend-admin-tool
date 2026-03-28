import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateInvoiceDto } from './dto/create-invoice.dto';
import { UpdateInvoiceDto } from './dto/update-invoice.dto';
import { InvoiceDto } from 'prisma/src/generated/dto/invoice.dto';
import { PagingResultDto } from 'lib/dto/genericPagingResultDto';
import { transformResponse } from 'lib/utils/transform';
import { isNoChange } from 'lib/utils/isNoChange';
import { TenantDbContext } from 'lib/tenant-db-context';

@Injectable()
export class InvoicesRepository {
  constructor(private readonly db: TenantDbContext) {}

  async create(data: CreateInvoiceDto): Promise<InvoiceDto> {
    const existing = await this.db.prisma.invoice.findUnique({
      where: { orderId: data.orderId },
    });
    if (existing) {
      throw new BadRequestException(`Invoice for this order already exists`);
    }
    const invoice = await this.db.prisma.invoice.create({ data });
    return transformResponse(InvoiceDto, invoice);
  }

  async findAll(limit = 10, page = 1): Promise<PagingResultDto<InvoiceDto>> {
    const [invoices, meta] = await this.db.prisma.invoice
      .paginate({ where: { deleted: false } })
      .withPages({ limit, page, includePageCount: true });

    return {
      data: invoices.map((i: InvoiceDto) => transformResponse(InvoiceDto, i)),
      meta,
    };
  }

  async findById(invoiceId: string): Promise<InvoiceDto> {
    const invoice = await this.db.prisma.invoice.findUnique({
      where: { invoiceId },
    });
    if (!invoice) {
      throw new NotFoundException(`Invoice with ID ${invoiceId} not found`);
    }
    return transformResponse(InvoiceDto, invoice);
  }

  async update(invoiceId: string, data: UpdateInvoiceDto): Promise<InvoiceDto> {
    const existing = await this.db.prisma.invoice.findUnique({
      where: { invoiceId },
    });
    if (!existing) {
      throw new NotFoundException(`Invoice with ID ${invoiceId} not found`);
    }
    if (isNoChange<UpdateInvoiceDto>(data, existing as any)) {
      throw new BadRequestException(
        `No changes detected for invoice ${invoiceId}`,
      );
    }
    const invoice = await this.db.prisma.invoice.update({
      where: { invoiceId },
      data,
    });
    return transformResponse(InvoiceDto, invoice);
  }
}
