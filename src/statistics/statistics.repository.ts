import { Inject, Injectable } from '@nestjs/common';
import { CustomPrismaService } from 'nestjs-prisma';
import { ExtendedPrismaClient } from 'prisma/prisma.extension';
import { OrderState, BusinessSector } from '@prisma/client';
import { OrderStateCountDto } from './dto/order-state-count.dto';
import { CustomerBusinessSectorDto } from './dto/customer-business-sector.dto';
import { QuickStatsDto } from './dto/quick-stats.dto';
import { RevenueStatsDto } from './dto/revenue-stats.dto';
import { SalesStatsDto } from './dto/sales-stats.dto';
import { AverageOrderValueStatsDto } from './dto/average-order-value-stats.dto';
import { CustomerStatsDto } from './dto/customer-stats.dto';

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

  private getMonthDateRange(date: Date) {
    const start = new Date(date.getFullYear(), date.getMonth(), 1);
    const end = new Date(date.getFullYear(), date.getMonth() + 1, 1);
    return { start, end };
  }

  async getRevenueStats(): Promise<RevenueStatsDto> {
    const { start: currentStart, end: currentEnd } = this.getMonthDateRange(new Date());
    const { start: lastStart, end: lastEnd } = this.getMonthDateRange(
      new Date(new Date().getFullYear(), new Date().getMonth() - 1, 1),
    );

    const [current, last] = await this.prisma.client.$transaction([
      this.prisma.client.invoice.aggregate({
        _sum: { invoiceAmount: true },
        where: { paymentDate: { gte: currentStart, lt: currentEnd } },
      }),
      this.prisma.client.invoice.aggregate({
        _sum: { invoiceAmount: true },
        where: { paymentDate: { gte: lastStart, lt: lastEnd } },
      }),
    ]);

    const currentRevenue = current._sum.invoiceAmount || 0;
    const lastRevenue = last._sum.invoiceAmount || 0;
    const percentageChange =
      lastRevenue !== 0
        ? Number(((currentRevenue - lastRevenue) / lastRevenue) * 100)
        : null;

    return { currentMonthRevenue: currentRevenue, percentageChange };
  }

  async getSalesStats(): Promise<SalesStatsDto> {
    const { start: currentStart, end: currentEnd } = this.getMonthDateRange(new Date());
    const { start: lastStart, end: lastEnd } = this.getMonthDateRange(
      new Date(new Date().getFullYear(), new Date().getMonth() - 1, 1),
    );

    const [current, last] = await this.prisma.client.$transaction([
      this.prisma.client.order.count({
        where: { orderDate: { gte: currentStart, lt: currentEnd } },
      }),
      this.prisma.client.order.count({
        where: { orderDate: { gte: lastStart, lt: lastEnd } },
      }),
    ]);

    const percentageChange =
      last !== 0 ? Number(((current - last) / last) * 100) : null;

    return { currentMonthSales: current, percentageChange };
  }

  async getAverageOrderValueStats(): Promise<AverageOrderValueStatsDto> {
    const { start: currentStart, end: currentEnd } = this.getMonthDateRange(new Date());
    const { start: lastStart, end: lastEnd } = this.getMonthDateRange(
      new Date(new Date().getFullYear(), new Date().getMonth() - 1, 1),
    );

    const [current, last] = await this.prisma.client.$transaction([
      this.prisma.client.invoice.aggregate({
        _avg: { invoiceAmount: true },
        where: { paymentDate: { gte: currentStart, lt: currentEnd } },
      }),
      this.prisma.client.invoice.aggregate({
        _avg: { invoiceAmount: true },
        where: { paymentDate: { gte: lastStart, lt: lastEnd } },
      }),
    ]);

    const currentAvg = Math.round(current._avg.invoiceAmount ?? 0);
    const lastAvg = last._avg.invoiceAmount
      ? Math.round(last._avg.invoiceAmount)
      : null;

    const percentageChange =
      lastAvg && lastAvg !== 0
        ? Number(((currentAvg - lastAvg) / lastAvg) * 100)
        : null;

    return {
      currentMonthAIV: currentAvg,
      lastMonthAIV: lastAvg,
      percentageChange,
    };
  }

  async getCustomerStats(): Promise<CustomerStatsDto> {
    const { start: currentStart, end: currentEnd } = this.getMonthDateRange(new Date());
    const { start: lastStart, end: lastEnd } = this.getMonthDateRange(
      new Date(new Date().getFullYear(), new Date().getMonth() - 1, 1),
    );

    const [current, last] = await this.prisma.client.$transaction([
      this.prisma.client.customer.count({
        where: { signedUp: { gte: currentStart, lt: currentEnd } },
      }),
      this.prisma.client.customer.count({
        where: { signedUp: { gte: lastStart, lt: lastEnd } },
      }),
    ]);

    const percentageChange =
      last !== 0 ? Number(((current - last) / last) * 100) : null;

    return { currentMonthSignUps: current, percentageChange };
  }
}
