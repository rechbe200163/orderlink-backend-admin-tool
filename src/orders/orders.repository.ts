import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CustomPrismaService } from 'nestjs-prisma';
import { ExtendedPrismaClient } from 'prisma/prisma.extension';
import { transformResponse } from 'lib/utils/transform';
import { PagingResultDto } from 'lib/dto/genericPagingResultDto';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { OrderDto } from './dto/order.dto';
import { isNoChange } from 'lib/utils/isNoChange';
import { OrderState } from '@prisma/client';

@Injectable()
export class OrdersRepository {
  constructor(
    @Inject('PrismaService')
    private readonly prismaService: CustomPrismaService<ExtendedPrismaClient>,
  ) {}

  async create(createOrderDto: CreateOrderDto): Promise<OrderDto> {
    const order = await this.prismaService.client.order.create({
      data: {
        customerReference: createOrderDto.customerReference,
        deliveryDate: createOrderDto.deliveryDate,
        selfCollect: createOrderDto.selfCollect ?? false,
      },
    });
    return transformResponse(OrderDto, order);
  }

  async findAll(
    limit = 10,
    page = 1,
    orderState?: OrderState,
    startDate?: Date,
    endDate?: Date,
    customerReference?: number,
  ): Promise<PagingResultDto<OrderDto>> {
    const [orders, meta] = await this.prismaService.client.order
      .paginate({
        where: {
          deleted: false,

          ...(customerReference && { customerReference }),
          ...(orderState && { status }),
          ...(startDate && { orderDate: { gte: new Date(startDate) } }),
          ...(endDate && { orderDate: { lte: new Date(endDate) } }),
        },
        orderBy: { orderDate: 'desc' },
      })
      .withPages({
        limit,
        page,
        includePageCount: true,
      });

    return {
      data: orders.map((order) => transformResponse(OrderDto, order)),
      meta,
    };
  }

  findAllOrders(): Promise<any> {
    return this.prismaService.client.order.findMany({
      // with address of customer
      include: {
        customer: {
          include: {
            address: true,
          },
        },
      },
      where: { deleted: false },
      orderBy: { orderDate: 'desc' },
    });
  }

  async findById(orderId: string): Promise<OrderDto> {
    const order = await this.prismaService.client.order.findUnique({
      where: { orderId },
    });
    if (!order) {
      throw new NotFoundException(`Order with ID ${orderId} not found`);
    }
    return transformResponse(OrderDto, order);
  }

  async update(
    orderId: string,
    updateOrderDto: UpdateOrderDto,
  ): Promise<OrderDto> {
    const existing = await this.prismaService.client.order.findUnique({
      where: { orderId },
    });
    if (!existing) {
      throw new NotFoundException(`Order with ID ${orderId} not found`);
    }
    //!TODO: fix this type issue
    if (isNoChange<UpdateOrderDto>(updateOrderDto, existing as any)) {
      throw new BadRequestException(`No changes detected for order ${orderId}`);
    }
    const order = await this.prismaService.client.order.update({
      where: { orderId },
      data: updateOrderDto,
    });
    return transformResponse(OrderDto, order);
  }
}
