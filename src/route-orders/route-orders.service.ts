import { Injectable } from '@nestjs/common';
import { CreateRouteOrderDto } from './dto/create-route-order.dto';
import { UpdateRouteOrderDto } from './dto/update-route-order.dto';
import { RoutesOrdersRepository } from './routes-orders.repository';
import { SortOrder } from 'src/common/enums/sort-order.enum';
@Injectable()
export class RouteOrdersService {
  constructor(
    private readonly routeOrdersRepository: RoutesOrdersRepository
  ) {}

  create(createRouteOrderDto: CreateRouteOrderDto) {
    return 'This action adds a new routeOrder';
  }

  findAll() {
    return `This action returns all routeOrders`;
  }

  findOne(id: number) {
    return `This action returns a #${id} routeOrder`;
  }

  update(id: number, updateRouteOrderDto: UpdateRouteOrderDto) {
    return `This action updates a #${id} routeOrder`;
  }

  remove(id: number) {
    return `This action removes a #${id} routeOrder`;
  }

  findOrdersbyRouteId(
      limit = 10,
      page = 1,
      routeId: string,
      sort?: string,
      order?: SortOrder) {
    return this.routeOrdersRepository.findAllOrdersbyRouteId(limit, page, routeId, sort, order)
  }
}
