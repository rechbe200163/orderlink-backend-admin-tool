import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { RouteOrdersService } from './route-orders.service';
import { CreateRouteOrderDto } from './dto/create-route-order.dto';
import { UpdateRouteOrderDto } from './dto/update-route-order.dto';
import { string } from 'zod';
import { PaginationQueryDto } from 'src/common/dto/pagination-query.dto';
import { HttpCacheInterceptor } from 'lib/interceptors/custom.cache-intercaptor';
import { ApiBearerAuth, ApiInternalServerErrorResponse } from '@nestjs/swagger';
import { Resource } from 'lib/decorators/resource.decorator';
import { Resources } from '../rbac/resources.enum';
import { UseInterceptors, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/guards/jwt.guard';
import { PermissionsGuard } from 'src/auth/guards/RBACGuard';

@Controller('route-orders')
@UseInterceptors(HttpCacheInterceptor)
@Resource(Resources.ORDER)
@ApiInternalServerErrorResponse({ description: 'Internal server error' })
@ApiBearerAuth()
//@UseGuards(JwtAuthGuard, PermissionsGuard)
export class RouteOrdersController {
  constructor(private readonly routeOrdersService: RouteOrdersService) {}

  @Get('/orders/:routeId')
  findAllOrdersByRouteId(
    @Query() query: PaginationQueryDto,
    @Param('routeId') routeId: string)
  {
    
    const {limit, page, sort, order} = query;
    return this.routeOrdersService.findOrdersbyRouteId(
      limit,
      page,
      routeId,
      sort,
      order
    );
  }
}
