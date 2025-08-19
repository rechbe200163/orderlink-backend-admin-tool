import { Injectable } from '@nestjs/common';
import { OrdersRepository } from './orders.repository';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { PagingResultDto } from 'lib/dto/genericPagingResultDto';
import { OrderDto } from './dto/order.dto';
import { OrderState } from '@prisma/client';
import { TypedEventEmitter } from 'src/event-emitter/typed-event-emitter.class';

@Injectable()
export class OrdersService {
  constructor(
    private readonly ordersRepository: OrdersRepository,
    private readonly eventEmitter: TypedEventEmitter,
  ) {}

  async create(createOrderDto: CreateOrderDto): Promise<OrderDto> {
    const order = await this.ordersRepository.create(createOrderDto);
    this.eventEmitter.emit('order.created', {
      orderId: order.orderId,
      customerReference: createOrderDto.customerReference,
      items: createOrderDto.products,
    });
    return order;
  }

  findAll(
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
      limit,
      page,
      orderState,
      startDate,
      endDate,
      customerReference,
    );
  }

  findOne(id: string): Promise<OrderDto> {
    return this.ordersRepository.findById(id);
  }

  findAllOrders(): Promise<any> {
    return this.ordersRepository.findAllOrders();
  }

  update(id: string, updateOrderDto: UpdateOrderDto): Promise<OrderDto> {
    return this.ordersRepository.update(id, updateOrderDto);
  }
}
