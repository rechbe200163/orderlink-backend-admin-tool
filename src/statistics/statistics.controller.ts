import { Ressource } from './../../prisma/src/generated/client/index.d';
import {
  Controller,
  Get,
  UseInterceptors,
  UseGuards,
  Request,
  Req,
} from '@nestjs/common';
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
import { requireTenantId } from 'lib/common/tenant.util';

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
  getOrderStates(@Req() req) {
    const { tenantId } = requireTenantId(req);
    return this.statisticsService.getOrderStateCounts(tenantId);
  }

  @Get('customers/business-sector')
  @ApiOkResponse({ type: CustomerBusinessSectorDto })
  getCustomerBusinessSectors(@Req() req) {
    const { tenantId } = requireTenantId(req);
    return this.statisticsService.getCustomerBusinessSectors(tenantId);
  }

  @Get('quick')
  @ApiOkResponse({ type: QuickStatsDto })
  getQuickStats(@Req() req) {
    const { tenantId } = requireTenantId(req);
    return this.statisticsService.getQuickStats(tenantId);
  }

  @Get('revenue')
  @ApiOkResponse({ type: RevenueStatsDto })
  getRevenueStats(@Req() req) {
    const { tenantId } = requireTenantId(req);
    return this.statisticsService.getRevenueStats(tenantId);
  }

  @Get('sales')
  @ApiOkResponse({ type: SalesStatsDto })
  getSalesStats(@Req() req) {
    const { tenantId } = requireTenantId(req);
    return this.statisticsService.getSalesStats(tenantId);
  }

  @Get('average-order-value')
  @ApiOkResponse({ type: AverageOrderValueStatsDto })
  getAverageOrderValueStats(@Req() req) {
    const { tenantId } = requireTenantId(req);
    return this.statisticsService.getAverageOrderValueStats(tenantId);
  }

  @Get('customers/monthly-signups')
  @ApiOkResponse({ type: CustomerStatsDto })
  getCustomerStats(@Req() req) {
    const { tenantId } = requireTenantId(req);
    return this.statisticsService.getCustomerStats(tenantId);
  }
}
