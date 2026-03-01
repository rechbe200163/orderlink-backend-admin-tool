import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { transformResponse } from 'lib/utils/transform';
import { PagingResultDto } from 'lib/dto/genericPagingResultDto';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { OrderDto } from './dto/order.dto';
import { isNoChange } from 'lib/utils/isNoChange';
import { OrderState } from 'generated/prisma/client';
import { ProductDto } from 'src/products/dto/product.dto';
import { PrismaService } from 'src/prisma.service';
import { SortOrder } from 'src/common/enums/sort-order.enum';

@Injectable()
export class OrdersRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(createOrderDto: CreateOrderDto): Promise<OrderDto> {
    const order = await this.prisma.db.order.create({
      data: {
        customerReference: createOrderDto.customerReference,
        deliveryDate: createOrderDto.deliveryDate,
        selfCollect: createOrderDto.selfCollect ?? false,
        products: {
          create: createOrderDto.products.map((p) => ({
            productId: p.productId,
            productAmount: p.productAmount,
          })),
        },
      },
    });
    return transformResponse(OrderDto, order);
  }

  async findAll(
    limit = 10,
    page = 1,
    sort?: string,
    order?: SortOrder,
    orderState?: OrderState,
    startDate?: Date,
    endDate?: Date,
    customerReference?: number,
  ): Promise<
    PagingResultDto<
      OrderDto & {
        products: {
          productAmount: number;
          product: ProductDto;
        }[];
        customer: {
          customerReference: number;
          firstName: string;
          lastName: string;
        };
      }
    >
  > {
    const [orders, meta] = await this.prisma.db.order
      .paginate({
        where: {
          deleted: false,

          ...(customerReference && { customerReference }),
          ...(orderState && { orderState }),
          ...(startDate || endDate
            ? {
                orderDate: {
                  ...(startDate && {
                    gte: new Date(`${startDate}T00:00:00.000Z`),
                  }),
                  ...(endDate && { lte: new Date(`${endDate}T23:59:59.999Z`) }),
                },
              }
            : {}),
        },
        include: {
          products: {
            select: {
              productAmount: true,

              product: true,
            },
          },
          customer: {
            select: {
              customerReference: true,
              firstName: true,
              lastName: true,
            },
          },
        },

        orderBy: sort
          ? {
              [sort]: order ? order : 'asc',
            }
          : undefined,
      })
      .withPages({
        limit,
        page,
        includePageCount: true,
      });

    console.log(
      'Found orders:',
      JSON.stringify(orders, null, 2),
      'with meta:',
      meta,
    );

    const data = orders.map((o: any) => ({
      ...transformResponse(OrderDto, o),
      products: o.products.map((p: any) => ({
        productAmount: p.productAmount,
        product: transformResponse(ProductDto, p.product),
      })),
      customer: {
        customerReference: o.customer.customerReference,
        firstName: o.customer.firstName,
        lastName: o.customer.lastName,
      },
    }));

    return {
      data,
      meta,
    };
  }

  findAllOrders(): Promise<any> {
    return this.prisma.db.order.findMany({
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
    const order = await this.prisma.db.order.findUnique({
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
    const existing = await this.prisma.db.order.findUnique({
      where: { orderId },
    });
    if (!existing) {
      throw new NotFoundException(`Order with ID ${orderId} not found`);
    }
    if (isNoChange<UpdateOrderDto>(updateOrderDto, existing as any)) {
      throw new BadRequestException(`No changes detected for order ${orderId}`);
    }
    const { products, ...rest } = updateOrderDto;
    const order = await this.prisma.db.order.update({
      where: { orderId },
      data: {
        ...rest,
        ...(products && {
          products: {
            // Remove all existing products and add new ones
            deleteMany: {},
            create: products.map((p) => ({
              productId: p.productId,
              productAmount: p.productAmount,
            })),
          },
        }),
      },
    });
    return transformResponse(OrderDto, order);
  }
}
