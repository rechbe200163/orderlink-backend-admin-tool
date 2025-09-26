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
  Request,
} from '@nestjs/common';
import { AddressesService } from './addresses.service';
import { CacheInterceptor } from '@nestjs/cache-manager';
import { Resources } from '../rbac/resources.enum';
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
import { CreateAddressDto } from 'prisma/src/generated/dto/create-address.dto';
import { UpdateAddressDto } from 'prisma/src/generated/dto/update-address.dto';
import { AddressDto } from 'prisma/src/generated/dto/address.dto';
import { PagingResultDto } from 'lib/dto/genericPagingResultDto';
import { MAX_PAGE_SIZE } from 'lib/constants';
import { requireTenantId } from 'lib/common/tenant.util';

@Controller('addresses')
@UseInterceptors(CacheInterceptor)
@Resource(Resources.ADDRESS)
@ApiInternalServerErrorResponse({ description: 'Internal server error' })
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PermissionsGuard)
@ApiForbiddenResponse({
  description:
    'Role does not have the permissions to perform this action on the requested resource',
})
export class AddressesController {
  constructor(private readonly addressesService: AddressesService) {}

  @Post()
  @ApiBody({ type: CreateAddressDto })
  @ApiOkResponse({ type: AddressDto })
  create(@Request() req, @Body() createAddressDto: CreateAddressDto) {
    const { tenantId } = requireTenantId(req);

    return this.addressesService.create(tenantId, createAddressDto);
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
  @ApiQuery({
    name: 'query',
    type: String,
    required: false,
    description: 'Optional search query to filter addresses',
    example: '123 Main St',
  })
  @ApiOkResponse({ type: PagingResultDto<AddressDto> })
  findAll(
    @Request() req,
    @Query('limit', ParseIntPipe) limit = 10,
    @Query('page', ParseIntPipe) page = 1,
    @Query('query') query?: string,
  ) {
    const { tenantId } = requireTenantId(req);
    if (limit > MAX_PAGE_SIZE) {
      throw new BadRequestException(`Limit cannot exceed ${MAX_PAGE_SIZE}`);
    }
    return this.addressesService.findAllPaging(tenantId, limit, page, query);
  }

  @Get('all')
  @ApiOkResponse({ type: [AddressDto] })
  findAllAddresses(@Request() req) {
    const { tenantId } = requireTenantId(req);
    return this.addressesService.findAll(tenantId);
  }

  @Get(':addressId')
  @ApiParam({ name: 'addressId', type: String })
  @ApiOkResponse({ type: AddressDto })
  findOne(
    @Request() req,
    @Param('addressId', ParseUUIDPipe) addressId: string,
  ) {
    const { tenantId } = requireTenantId(req);
    return this.addressesService.findById(tenantId, addressId);
  }

  @Patch(':addressId')
  @ApiParam({ name: 'addressId', type: String })
  @ApiBody({ type: UpdateAddressDto })
  @ApiOkResponse({ type: AddressDto })
  update(
    @Request() req,
    @Param('addressId', ParseUUIDPipe) addressId: string,
    @Body() updateAddressDto: UpdateAddressDto,
  ) {
    const { tenantId } = requireTenantId(req);
    return this.addressesService.update(tenantId, addressId, updateAddressDto);
  }
}
