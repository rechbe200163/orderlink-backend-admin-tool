import { OrderStateCountDto } from './dto/order-state-count.dto';
import { CustomerBusinessSectorDto } from './dto/customer-business-sector.dto';
import { QuickStatsDto } from './dto/quick-stats.dto';
import { RevenueStatsDto } from './dto/revenue-stats.dto';
import { SalesStatsDto } from './dto/sales-stats.dto';
import { AverageOrderValueStatsDto } from './dto/average-order-value-stats.dto';
import { CustomerStatsDto } from './dto/customer-stats.dto';
import { Injectable } from '@nestjs/common';
import { TenantDbContext } from 'lib/tenant-db-context';
import { BusinessSector, OrderState } from 'generated/client';

@Injectable()
export class StatisticsRepository {
  constructor(private readonly db: TenantDbContext) {}

  async getOrderStateCounts(): Promise<OrderStateCountDto[]> {
    const grouped = await this.db.prisma.order.groupBy({
      by: ['orderState'],
      _count: true,
    });

    return grouped.map((g) => ({
      orderState: g.orderState as OrderState,
      _count: g._count,
    }));
  }

  async getCustomerBusinessSectors(): Promise<CustomerBusinessSectorDto> {
    const grouped = await this.db.prisma.customer.groupBy({
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

    const totalCustomers = await this.db.prisma.customer.count();

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
    ] = await this.db.prisma.$transaction([
      this.db.prisma.customer.count(),
      this.db.prisma.order.count(),
      this.db.prisma.employees.count(),
      this.db.prisma.product.count(),
      this.db.prisma.category.count(),
      this.db.prisma.route.count(),
      this.db.prisma.invoice.count(),
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
    const { start: currentStart, end: currentEnd } = this.getMonthDateRange(
      new Date(),
    );
    const { start: lastStart, end: lastEnd } = this.getMonthDateRange(
      new Date(new Date().getFullYear(), new Date().getMonth() - 1, 1),
    );

    const [current, last] = await this.db.prisma.$transaction([
      this.db.prisma.invoice.aggregate({
        _sum: { invoiceAmount: true },
        where: { paymentDate: { gte: currentStart, lt: currentEnd } },
      }),
      this.db.prisma.invoice.aggregate({
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
    const { start: currentStart, end: currentEnd } = this.getMonthDateRange(
      new Date(),
    );
    const { start: lastStart, end: lastEnd } = this.getMonthDateRange(
      new Date(new Date().getFullYear(), new Date().getMonth() - 1, 1),
    );

    const [current, last] = await this.db.prisma.$transaction([
      this.db.prisma.order.count({
        where: { orderDate: { gte: currentStart, lt: currentEnd } },
      }),
      this.db.prisma.order.count({
        where: { orderDate: { gte: lastStart, lt: lastEnd } },
      }),
    ]);

    const percentageChange =
      last !== 0 ? Number(((current - last) / last) * 100) : null;

    return { currentMonthSales: current, percentageChange };
  }

  async getAverageOrderValueStats(): Promise<AverageOrderValueStatsDto> {
    const { start: currentStart, end: currentEnd } = this.getMonthDateRange(
      new Date(),
    );
    const { start: lastStart, end: lastEnd } = this.getMonthDateRange(
      new Date(new Date().getFullYear(), new Date().getMonth() - 1, 1),
    );

    const [current, last] = await this.db.prisma.$transaction([
      this.db.prisma.invoice.aggregate({
        _avg: { invoiceAmount: true },
        where: { paymentDate: { gte: currentStart, lt: currentEnd } },
      }),
      this.db.prisma.invoice.aggregate({
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
    const { start: currentStart, end: currentEnd } = this.getMonthDateRange(
      new Date(),
    );
    const { start: lastStart, end: lastEnd } = this.getMonthDateRange(
      new Date(new Date().getFullYear(), new Date().getMonth() - 1, 1),
    );

    const [current, last] = await this.db.prisma.$transaction([
      this.db.prisma.customer.count({
        where: { signedUp: { gte: currentStart, lt: currentEnd } },
      }),
      this.db.prisma.customer.count({
        where: { signedUp: { gte: lastStart, lt: lastEnd } },
      }),
    ]);

    const percentageChange =
      last !== 0 ? Number(((current - last) / last) * 100) : null;

    return { currentMonthSignUps: current, percentageChange };
  }
}
