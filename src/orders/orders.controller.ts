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
import { HttpCacheInterceptor } from 'lib/interceptors/custom.cache-intercaptor';
import { Resources } from '../rbac/resources.enum';
import { Resource } from 'lib/decorators/resource.decorator';
import { JwtAuthGuard } from 'src/auth/guards/jwt.guard';
import { PermissionsGuard } from 'src/auth/guards/RBACGuard';
import { PagingResultDto } from 'lib/dto/genericPagingResultDto';
import { OrderDto } from './dto/order.dto';
import { OrderState } from 'generated/client';
import { PaginationQueryDto } from 'src/common/dto/pagination-query.dto';

@Controller('orders')
@UseInterceptors(HttpCacheInterceptor)
@Resource(Resources.ORDER)
@ApiInternalServerErrorResponse({ description: 'Internal server error' })
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post()
  @ApiBody({ type: CreateOrderDto })
  @ApiOkResponse({ type: OrderDto, description: 'Order created successfully' })
  create(@Body() createOrderDto: CreateOrderDto) {
    return this.ordersService.create(createOrderDto);
  }

  @Get()
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
    @Query() query: PaginationQueryDto,
    @Query('orderState', new ParseEnumPipe(OrderState, { optional: true }))
    orderState?: OrderState,
    @Query('startDate') startDate?: Date,
    @Query('endDate') endDate?: Date,
    @Query('customerReference', new ParseIntPipe({ optional: true }))
    customerReference?: number,
  ) {
    const { limit, page, sort, order } = query;
    return this.ordersService.findAll(
      limit,
      page,
      sort,
      order,
      orderState,
      startDate,
      endDate,
      customerReference,
    );
  }

  @Get('all')
  findAllOrders() {
    return this.ordersService.findAllOrders();
  }

  @Get(':orderId')
  @ApiParam({ name: 'orderId', type: String })
  @ApiOkResponse({ type: OrderDto })
  findOne(@Param('orderId', ParseUUIDPipe) orderId: string) {
    return this.ordersService.findOne(orderId);
  }

  @Patch(':orderId')
  @ApiParam({ name: 'orderId', type: String })
  @ApiBody({ type: UpdateOrderDto })
  @ApiOkResponse({ type: OrderDto })
  update(
    @Param('orderId', ParseUUIDPipe) orderId: string,
    @Body() updateOrderDto: UpdateOrderDto,
  ) {
    return this.ordersService.update(orderId, updateOrderDto);
  }
}
