import { Injectable } from '@nestjs/common';
import { RoutesRepository } from './routes.repository';
import { CreateRouteDto } from 'prisma/src/generated/dto/create-route.dto';
import { UpdateRouteDto } from 'prisma/src/generated/dto/update-route.dto';
import { PagingResultDto } from 'lib/dto/genericPagingResultDto';
import { RouteDto } from 'prisma/src/generated/dto/route.dto';

@Injectable()
export class RoutesService {
  constructor(private readonly routesRepository: RoutesRepository) {}

  create(createRouteDto: CreateRouteDto): Promise<RouteDto> {
    return this.routesRepository.create(createRouteDto);
  }

  findAll(
    limit = 10,
    page = 1,
    search?: string,
  ): Promise<PagingResultDto<RouteDto & { ordersCount: number }>> {
    return this.routesRepository.findAll(limit, page, search);
  }

  findById(id: string): Promise<RouteDto> {
    return this.routesRepository.findById(id);
  }

  update(id: string, updateRouteDto: UpdateRouteDto): Promise<RouteDto> {
    return this.routesRepository.update(id, updateRouteDto);
  }
}
