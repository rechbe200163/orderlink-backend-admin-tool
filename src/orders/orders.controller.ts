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
import { CacheInterceptor } from '@nestjs/cache-manager';
import { Resources } from '../rbac/resources.enum';
import { Resource } from 'lib/decorators/resource.decorator';
import { JwtAuthGuard } from 'src/auth/guards/jwt.guard';
import { PermissionsGuard } from 'src/auth/guards/RBACGuard';
import { PagingResultDto } from 'lib/dto/genericPagingResultDto';
import { OrderDto } from './dto/order.dto';
import { MAX_PAGE_SIZE } from 'lib/constants';
import { OrderState } from '@prisma/client';

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
  create(@Body() createOrderDto: CreateOrderDto) {
    return this.ordersService.create(createOrderDto);
  }

  @Get()
  @ApiQuery({
    name: 'limit',
    type: Number,
    required: false,
    example: 10,
    maximum: MAX_PAGE_SIZE,
  })
  @ApiQuery({ name: 'page', type: Number, required: false, example: 1 })
  @ApiQuery({
    name: 'customerReference',
    type: Number,
    required: false,
    example: 123,
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
  @ApiOkResponse({ type: PagingResultDto<OrderDto> })
  findAll(
    @Query('limit', ParseIntPipe) limit = 10,
    @Query('page', ParseIntPipe) page = 1,
    @Query('orderState', new ParseEnumPipe(OrderState, { optional: true }))
    orderState?: OrderState,
    @Query('startDate') startDate?: Date,
    @Query('endDate') endDate?: Date,
    @Query('customerReference', ParseIntPipe) customerReference?: number,
  ) {
    if (limit > MAX_PAGE_SIZE) {
      throw new BadRequestException(`Limit cannot exceed ${MAX_PAGE_SIZE}`);
    }
    return this.ordersService.findAll(
      limit,
      page,
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

  @Get(':id')
  @ApiParam({ name: 'id', type: String })
  @ApiOkResponse({ type: OrderDto })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.ordersService.findOne(id);
  }

  @Patch(':id')
  @ApiParam({ name: 'id', type: String })
  @ApiBody({ type: UpdateOrderDto })
  @ApiOkResponse({ type: OrderDto })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateOrderDto: UpdateOrderDto,
  ) {
    return this.ordersService.update(id, updateOrderDto);
  }
}
