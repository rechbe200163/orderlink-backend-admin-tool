import { Injectable } from '@nestjs/common';
import { OrdersRepository } from './orders.repository';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { PagingResultDto } from 'lib/dto/genericPagingResultDto';
import { OrderDto } from './dto/order.dto';

@Injectable()
export class OrdersService {
  constructor(private readonly ordersRepository: OrdersRepository) {}

  create(createOrderDto: CreateOrderDto): Promise<OrderDto> {
    return this.ordersRepository.create(createOrderDto);
  }

  findAll(
    limit = 10,
    page = 1,
    customerReference?: number,
  ): Promise<PagingResultDto<OrderDto>> {
    return this.ordersRepository.findAll(limit, page, customerReference);
  }

  findOne(id: string): Promise<OrderDto> {
    return this.ordersRepository.findById(id);
  }

  update(id: string, updateOrderDto: UpdateOrderDto): Promise<OrderDto> {
    return this.ordersRepository.update(id, updateOrderDto);
  }

  remove(id: string): Promise<OrderDto> {
    return this.ordersRepository.remove(id);
  }
}
