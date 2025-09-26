import { Injectable } from '@nestjs/common';
import { StatisticsRepository } from './statistics.repository';

@Injectable()
export class StatisticsService {
  constructor(private readonly statisticsRepository: StatisticsRepository) {}

  getOrderStateCounts(tenantId: string) {
    return this.statisticsRepository.getOrderStateCounts(tenantId);
  }

  getCustomerBusinessSectors(tenantId: string) {
    return this.statisticsRepository.getCustomerBusinessSectors(tenantId);
  }

  getQuickStats(tenantId: string) {
    return this.statisticsRepository.getQuickStats(tenantId);
  }

  getRevenueStats(tenantId: string) {
    return this.statisticsRepository.getRevenueStats(tenantId);
  }

  getSalesStats(tenantId: string) {
    return this.statisticsRepository.getSalesStats(tenantId);
  }

  getAverageOrderValueStats(tenantId: string) {
    return this.statisticsRepository.getAverageOrderValueStats(tenantId);
  }

  getCustomerStats(tenantId: string) {
    return this.statisticsRepository.getCustomerStats(tenantId);
  }
}
