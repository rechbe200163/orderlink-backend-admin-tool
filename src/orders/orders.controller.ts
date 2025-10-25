import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  ParseUUIDPipe,
  ParseIntPipe,
  UseInterceptors,
  UseGuards,
  BadRequestException,
  ParseEnumPipe,
  Request,
} from '@nestjs/common';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import {
  ApiBearerAuth,
  ApiBody,
  ApiInternalServerErrorResponse,
  ApiOkResponse,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { CacheInterceptor } from '@nestjs/cache-manager';
import { Resources } from '../../lib/rbac/resources.enum';
import { Resource } from 'lib/decorators/resource.decorator';
import { JwtAuthGuard } from 'src/auth/guards/jwt.guard';
import { PermissionsGuard } from 'src/auth/guards/RBACGuard';
import { PagingResultDto } from 'lib/dto/genericPagingResultDto';
import { OrderDto } from './dto/order.dto';
import { MAX_PAGE_SIZE } from 'lib/constants';
import { OrderState } from '@prisma/client';
import { requireTenantId } from 'lib/common/tenant.util';

@Controller('orders')
@UseInterceptors(CacheInterceptor)
@Resource(Resources.ORDER)
@ApiInternalServerErrorResponse({ description: 'Internal server error' })
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post()
  @ApiBody({ type: CreateOrderDto })
  @ApiOkResponse({ type: OrderDto, description: 'Order created successfully' })
  create(@Request() req, @Body() createOrderDto: CreateOrderDto) {
    const { tenantId } = requireTenantId(req);
    return this.ordersService.create(tenantId, createOrderDto);
  }

  @Get()
  @ApiQuery({
    name: 'limit',
    type: Number,
    example: 10,
    maximum: MAX_PAGE_SIZE,
  })
  @ApiQuery({ name: 'page', type: Number, example: 1 })
  @ApiParam({
    name: 'customerReference',
    description: 'Customer reference number',
    type: Number,
    required: false,
    example: 123456789,
  })
  @ApiQuery({
    name: 'orderState',
    enum: OrderState,
    required: false,
    example: OrderState.IN_PROGRESS,
    default: undefined,
  })
  @ApiQuery({
    name: 'startDate',
    type: Date,
    required: false,
    example: new Date('2023-01-01'),
    default: undefined,
  })
  @ApiQuery({
    name: 'endDate',
    type: Date,
    required: false,
    example: new Date('2023-12-31'),
    default: undefined,
  })
  @ApiOkResponse({
    type: PagingResultDto<
      OrderDto & {
        customer: {
          customerReference: number;
          firstName: string;
          lastName: string;
        };
      }
    >,
  })
  findAll(
    @Request() req,
    @Query('limit', new ParseIntPipe()) limit = 10,
    @Query('page', new ParseIntPipe()) page = 1,
    @Query('orderState', new ParseEnumPipe(OrderState, { optional: true }))
    orderState?: OrderState,
    @Query('startDate') startDate?: Date,
    @Query('endDate') endDate?: Date,
    @Query('customerReference', new ParseIntPipe({ optional: true }))
    customerReference?: number,
  ) {
    const { tenantId } = requireTenantId(req);
    if (limit > MAX_PAGE_SIZE) {
      throw new BadRequestException(`Limit cannot exceed ${MAX_PAGE_SIZE}`);
    }
    return this.ordersService.findAll(
      tenantId,
      limit,
      page,
      orderState,
      startDate,
      endDate,
      customerReference,
    );
  }

  @Get('all')
  findAllOrders(@Request() req) {
    const { tenantId } = requireTenantId(req);
    return this.ordersService.findAllOrders(tenantId);
  }

  @Get(':orderId')
  @ApiParam({ name: 'orderId', type: String })
  @ApiOkResponse({ type: OrderDto })
  findOne(@Request() req, @Param('orderId', ParseUUIDPipe) orderId: string) {
    const { tenantId } = requireTenantId(req);
    return this.ordersService.findOne(tenantId, orderId);
  }

  @Patch(':orderId')
  @ApiParam({ name: 'orderId', type: String })
  @ApiBody({ type: UpdateOrderDto })
  @ApiOkResponse({ type: OrderDto })
  update(
    @Request() req,
    @Param('orderId', ParseUUIDPipe) orderId: string,
    @Body() updateOrderDto: UpdateOrderDto,
  ) {
    const { tenantId } = requireTenantId(req);
    return this.ordersService.update(tenantId, orderId, updateOrderDto);
  }
}
