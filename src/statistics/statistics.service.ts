import { Injectable } from '@nestjs/common';
import { StatisticsRepository } from './statistics.repository';

@Injectable()
export class StatisticsService {
  constructor(private readonly statisticsRepository: StatisticsRepository) {}

  getOrderStateCounts() {
    return this.statisticsRepository.getOrderStateCounts();
  }

  getCustomerBusinessSectors() {
    return this.statisticsRepository.getCustomerBusinessSectors();
  }

  getQuickStats() {
    return this.statisticsRepository.getQuickStats();
  }

  getRevenueStats() {
    return this.statisticsRepository.getRevenueStats();
  }

  getSalesStats() {
    return this.statisticsRepository.getSalesStats();
  }

  getAverageOrderValueStats() {
    return this.statisticsRepository.getAverageOrderValueStats();
  }

  getCustomerStats() {
    return this.statisticsRepository.getCustomerStats();
  }
}
