import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Query,
  ParseUUIDPipe,
  ParseIntPipe,
  UseInterceptors,
  UseGuards,
  BadRequestException,
  Req,
} from '@nestjs/common';
import { InvoicesService } from './invoices.service';
import { CacheInterceptor } from '@nestjs/cache-manager';
import { Resources } from '../../lib/rbac/resources.enum';
import { Resource } from 'lib/decorators/resource.decorator';
import {
  ApiBearerAuth,
  ApiBody,
  ApiForbiddenResponse,
  ApiInternalServerErrorResponse,
  ApiOkResponse,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/guards/jwt.guard';
import { PermissionsGuard } from 'src/auth/guards/RBACGuard';
import { CreateInvoiceDto } from './dto/create-invoice.dto';
import { UpdateInvoiceDto } from './dto/update-invoice.dto';
import { InvoiceDto } from 'prisma/src/generated/dto/invoice.dto';
import { PagingResultDto } from 'lib/dto/genericPagingResultDto';
import { MAX_PAGE_SIZE } from 'lib/constants';
import { requireTenantId } from 'lib/common/tenant.util';

@Controller('invoices')
@UseInterceptors(CacheInterceptor)
@Resource(Resources.INVOICE)
@ApiInternalServerErrorResponse({ description: 'Internal server error' })
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PermissionsGuard)
@ApiForbiddenResponse({
  description:
    'Role does not have the permissions to perform this action on the requested resource',
})
export class InvoicesController {
  constructor(private readonly invoicesService: InvoicesService) {}

  @Post()
  @ApiBody({ type: CreateInvoiceDto })
  @ApiOkResponse({ type: InvoiceDto })
  create(@Req() req, @Body() createInvoiceDto: CreateInvoiceDto) {
    const { tenantId } = requireTenantId(req);
    return this.invoicesService.create(tenantId, createInvoiceDto);
  }

  @Get()
  @ApiQuery({
    name: 'limit',
    type: Number,
    required: false,
    default: 10,
    maximum: MAX_PAGE_SIZE,
  })
  @ApiQuery({ name: 'page', type: Number, required: false, default: 1 })
  @ApiOkResponse({ type: PagingResultDto<InvoiceDto> })
  findAll(
    @Req() req,
    @Query('limit', ParseIntPipe) limit = 10,
    @Query('page', ParseIntPipe) page = 1,
  ) {
    const { tenantId } = requireTenantId(req);
    if (page < 1) {
      throw new BadRequestException('Page must be greater than 0');
    }
    if (limit > MAX_PAGE_SIZE) {
      throw new BadRequestException(`Limit cannot exceed ${MAX_PAGE_SIZE}`);
    }
    return this.invoicesService.findAll(tenantId, limit, page);
  }

  @Get(':invoiceId')
  @ApiParam({ name: 'invoiceId', type: String })
  @ApiOkResponse({ type: InvoiceDto })
  findOne(@Req() req, @Param('invoiceId', ParseUUIDPipe) invoiceId: string) {
    const { tenantId } = requireTenantId(req);
    return this.invoicesService.findById(tenantId, invoiceId);
  }

  @Patch(':invoiceId')
  @ApiParam({ name: 'invoiceId', type: String })
  @ApiBody({ type: UpdateInvoiceDto })
  @ApiOkResponse({ type: InvoiceDto })
  update(
    @Req() req,
    @Param('invoiceId', ParseUUIDPipe) invoiceId: string,
    @Body() updateInvoiceDto: UpdateInvoiceDto,
  ) {
    const { tenantId } = requireTenantId(req);
    return this.invoicesService.update(tenantId, invoiceId, updateInvoiceDto);
  }
}
