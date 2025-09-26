import { Injectable } from '@nestjs/common';
import { RoutesRepository } from './routes.repository';
import { CreateRouteDto } from 'prisma/src/generated/dto/create-route.dto';
import { UpdateRouteDto } from 'prisma/src/generated/dto/update-route.dto';
import { PagingResultDto } from 'lib/dto/genericPagingResultDto';
import { RouteDto } from 'prisma/src/generated/dto/route.dto';

@Injectable()
export class RoutesService {
  constructor(private readonly routesRepository: RoutesRepository) {}

  create(tenantId: string, createRouteDto: CreateRouteDto): Promise<RouteDto> {
    return this.routesRepository.create(tenantId, createRouteDto);
  }

  findAll(
    tenantId: string,
    limit = 10,
    page = 1,
    search?: string,
  ): Promise<PagingResultDto<RouteDto & { ordersCount: number }>> {
    return this.routesRepository.findAll(tenantId, limit, page, search);
  }

  findById(tenantId: string, id: string): Promise<RouteDto> {
    return this.routesRepository.findById(tenantId, id);
  }

  update(
    tenantId: string,
    id: string,
    updateRouteDto: UpdateRouteDto,
  ): Promise<RouteDto> {
    return this.routesRepository.update(tenantId, id, updateRouteDto);
  }
}
