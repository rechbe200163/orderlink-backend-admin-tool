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
import { ProductDto } from 'src/products/dto/product.dto';

@Injectable()
export class OrdersRepository {
  constructor(
    @Inject('PrismaService')
    private readonly prismaService: CustomPrismaService<ExtendedPrismaClient>,
  ) {}

  async create(
    tenantId: string,
    createOrderDto: CreateOrderDto,
  ): Promise<OrderDto> {
    const order = await this.prismaService.client.order.create({
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
        tenantId,
      },
    });
    return transformResponse(OrderDto, order);
  }

  async findAll(
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
    const [orders, meta] = await this.prismaService.client.order
      .paginate({
        where: {
          tenantId,
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

        orderBy: { orderDate: 'desc' },
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

  findAllOrders(tenantId: string): Promise<any> {
    return this.prismaService.client.order.findMany({
      // with address of customer
      include: {
        customer: {
          include: {
            address: true,
          },
        },
      },
      where: { deleted: false, tenantId },
      orderBy: { orderDate: 'desc' },
    });
  }

  async findById(tenantId: string, orderId: string): Promise<OrderDto> {
    const order = await this.prismaService.client.order.findUnique({
      where: { tenantId_orderId: { orderId, tenantId } },
    });
    if (!order) {
      throw new NotFoundException(`Order with ID ${orderId} not found`);
    }
    return transformResponse(OrderDto, order);
  }

  async update(
    tenantId: string,
    orderId: string,
    updateOrderDto: UpdateOrderDto,
  ): Promise<OrderDto> {
    const existing = await this.prismaService.client.order.findUnique({
      where: { tenantId_orderId: { orderId, tenantId } },
      include: { products: true },
    });
    if (!existing) {
      throw new NotFoundException(`Order with ID ${orderId} not found`);
    }
    if (isNoChange<UpdateOrderDto>(updateOrderDto, existing)) {
      throw new BadRequestException(`No changes detected for order ${orderId}`);
    }
    const { products, ...rest } = updateOrderDto;
    const order = await this.prismaService.client.order.update({
      where: { tenantId_orderId: { orderId, tenantId } },
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
