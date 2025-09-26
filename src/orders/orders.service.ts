import { Injectable } from '@nestjs/common';
import { OrdersRepository } from './orders.repository';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { PagingResultDto } from 'lib/dto/genericPagingResultDto';
import { OrderDto } from './dto/order.dto';
import { OrderState } from '@prisma/client';
import { TypedEventEmitter } from 'src/event-emitter/typed-event-emitter.class';
import { symlink } from 'fs';

@Injectable()
export class OrdersService {
  constructor(
    private readonly ordersRepository: OrdersRepository,
    private readonly eventEmitter: TypedEventEmitter,
  ) {}

  async create(
    tenantId: string,
    createOrderDto: CreateOrderDto,
  ): Promise<OrderDto> {
    const order = await this.ordersRepository.create(tenantId, createOrderDto);
    this.eventEmitter.emit('order.created', {
      tenantId,
      orderId: order.orderId,
      customerReference: createOrderDto.customerReference,
      items: createOrderDto.products,
    });
    return order;
  }

  findAll(
    tenantId: string,
    limit = 10,
    page = 1,
    orderState?: OrderState,
    startDate?: Date,
    endDate?: Date,
    customerReference?: number,
  ): Promise<
    PagingResultDto<
      OrderDto & {
        customer: {
          customerReference: number;
          firstName: string;
          lastName: string;
        };
      }
    >
  > {
    return this.ordersRepository.findAll(
      tenantId,
      limit,
      page,
      orderState,
      startDate,
      endDate,
      customerReference,
    );
  }

  findOne(tenantId: string, id: string): Promise<OrderDto> {
    return this.ordersRepository.findById(tenantId, id);
  }

  findAllOrders(tenantId: string): Promise<any> {
    return this.ordersRepository.findAllOrders(tenantId);
  }

  update(
    tenantId: string,
    id: string,
    updateOrderDto: UpdateOrderDto,
  ): Promise<OrderDto> {
    return this.ordersRepository.update(tenantId, id, updateOrderDto);
  }
}
