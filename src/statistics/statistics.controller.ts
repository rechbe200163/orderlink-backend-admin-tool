import { Ressource } from './../../prisma/src/generated/client/index.d';
import { Controller, Get, UseInterceptors, UseGuards } from '@nestjs/common';
import { CacheInterceptor } from '@nestjs/cache-manager';
import { StatisticsService } from './statistics.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt.guard';
import {
  ApiBearerAuth,
  ApiInternalServerErrorResponse,
  ApiOkResponse,
} from '@nestjs/swagger';
import { OrderStateCountDto } from './dto/order-state-count.dto';
import { CustomerBusinessSectorDto } from './dto/customer-business-sector.dto';
import { QuickStatsDto } from './dto/quick-stats.dto';
import { RevenueStatsDto } from './dto/revenue-stats.dto';
import { SalesStatsDto } from './dto/sales-stats.dto';
import { AverageOrderValueStatsDto } from './dto/average-order-value-stats.dto';
import { CustomerStatsDto } from './dto/customer-stats.dto';
import { ModuleTag } from 'lib/decorators/module.decorators';
import { ModuleEnum } from 'src/site-config/dto/modules-entity.dto';
import { ModulesGuard } from 'src/auth/guards/modules.guard';
import { PermissionsGuard } from 'src/auth/guards/RBACGuard';
import { Resource } from 'lib/decorators/resource.decorator';
import { Resources } from '@prisma/client';

@Controller('statistics')
@UseInterceptors(CacheInterceptor)
@ApiInternalServerErrorResponse({ description: 'Internal server error' })
@ApiBearerAuth()
@ModuleTag(ModuleEnum.STATISTICS)
@Resource(Resources.STATISTICS)
@UseGuards(JwtAuthGuard, PermissionsGuard, ModulesGuard)
export class StatisticsController {
  constructor(private readonly statisticsService: StatisticsService) {}

  @Get('orders/state')
  @ApiOkResponse({ type: OrderStateCountDto, isArray: true })
  getOrderStates() {
    return this.statisticsService.getOrderStateCounts();
  }

  @Get('customers/business-sector')
  @ApiOkResponse({ type: CustomerBusinessSectorDto })
  getCustomerBusinessSectors() {
    return this.statisticsService.getCustomerBusinessSectors();
  }

  @Get('quick')
  @ApiOkResponse({ type: QuickStatsDto })
  getQuickStats() {
    return this.statisticsService.getQuickStats();
  }

  @Get('revenue')
  @ApiOkResponse({ type: RevenueStatsDto })
  getRevenueStats() {
    return this.statisticsService.getRevenueStats();
  }

  @Get('sales')
  @ApiOkResponse({ type: SalesStatsDto })
  getSalesStats() {
    return this.statisticsService.getSalesStats();
  }

  @Get('average-order-value')
  @ApiOkResponse({ type: AverageOrderValueStatsDto })
  getAverageOrderValueStats() {
    return this.statisticsService.getAverageOrderValueStats();
  }

  @Get('customers/monthly-signups')
  @ApiOkResponse({ type: CustomerStatsDto })
  getCustomerStats() {
    return this.statisticsService.getCustomerStats();
  }
}
