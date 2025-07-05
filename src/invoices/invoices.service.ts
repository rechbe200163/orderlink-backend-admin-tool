import { Injectable } from '@nestjs/common';
import { InvoicesRepository } from './invoices.repository';
import { CreateInvoiceDto } from './dto/create-invoice.dto';
import { UpdateInvoiceDto } from './dto/update-invoice.dto';
import { PagingResultDto } from 'lib/dto/genericPagingResultDto';
import { InvoiceDto } from 'prisma/src/generated/dto/invoice.dto';

@Injectable()
export class InvoicesService {
  constructor(private readonly invoicesRepository: InvoicesRepository) {}

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
}
