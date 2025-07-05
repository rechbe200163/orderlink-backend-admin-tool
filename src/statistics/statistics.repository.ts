import { Inject, Injectable } from '@nestjs/common';
import { CustomPrismaService } from 'nestjs-prisma';
import { ExtendedPrismaClient } from 'prisma/prisma.extension';
import { OrderState, BusinessSector } from '@prisma/client';
import { OrderStateCountDto } from './dto/order-state-count.dto';
import { CustomerBusinessSectorDto } from './dto/customer-business-sector.dto';
import { QuickStatsDto } from './dto/quick-stats.dto';

@Injectable()
export class StatisticsRepository {
  constructor(
    @Inject('PrismaService')
    private readonly prisma: CustomPrismaService<ExtendedPrismaClient>,
  ) {}

  async getOrderStateCounts(): Promise<OrderStateCountDto[]> {
    const grouped = await this.prisma.client.order.groupBy({
      by: ['orderState'],
      _count: true,
    });

    return grouped.map((g) => ({
      orderState: g.orderState as OrderState,
      _count: g._count,
    }));
  }

  async getCustomerBusinessSectors(): Promise<CustomerBusinessSectorDto> {
    const grouped = await this.prisma.client.customer.groupBy({
      by: ['businessSector'],
      _count: true,
    });

    const sectors = grouped.reduce(
      (acc, cur) => {
        if (cur.businessSector) {
          acc[cur.businessSector as BusinessSector] = cur._count;
        }
        return acc;
      },
      {} as Record<BusinessSector, number>,
    );

    const totalCustomers = await this.prisma.client.customer.count();

    return { totalCustomers, sectors };
  }

  async getQuickStats(): Promise<QuickStatsDto> {
    const [
      totalCustomers,
      totalOrders,
      totalEmployees,
      totalProducts,
      totalCategories,
      totalRoutes,
      totalInvoices,
    ] = await this.prisma.client.$transaction([
      this.prisma.client.customer.count(),
      this.prisma.client.order.count(),
      this.prisma.client.employees.count(),
      this.prisma.client.product.count(),
      this.prisma.client.category.count(),
      this.prisma.client.route.count(),
      this.prisma.client.invoice.count(),
    ]);

    return {
      totalCustomers,
      totalOrders,
      totalEmployees,
      totalProducts,
      totalCategories,
      totalRoutes,
      totalInvoices,
    };
  }
}
