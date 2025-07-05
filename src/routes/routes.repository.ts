import { BadRequestException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { CustomPrismaService } from 'nestjs-prisma';
import { ExtendedPrismaClient } from 'prisma/prisma.extension';
import { CreateRouteDto } from 'prisma/src/generated/dto/create-route.dto';
import { UpdateRouteDto } from 'prisma/src/generated/dto/update-route.dto';
import { RouteDto } from 'prisma/src/generated/dto/route.dto';
import { PagingResultDto } from 'lib/dto/genericPagingResultDto';
import { transformResponse } from 'lib/utils/transform';
import { isNoChange } from 'lib/utils/isNoChange';

@Injectable()
export class RoutesRepository {
  constructor(
    @Inject('PrismaService')
    private prismaService: CustomPrismaService<ExtendedPrismaClient>,
  ) {}

  async create(data: CreateRouteDto): Promise<RouteDto> {
    const existing = await this.prismaService.client.route.findFirst({
      where: { name: data.name },
    });
    if (existing) {
      throw new BadRequestException(`Route with name ${data.name} already exists`);
    }
    const route = await this.prismaService.client.route.create({ data });
    return transformResponse(RouteDto, route);
  }

  async findAll(limit = 10, page = 1, search?: string): Promise<PagingResultDto<RouteDto>> {
    const [routes, meta] = await this.prismaService.client.route
      .paginate({
        where: {
          deleted: false,
          name: search ? { contains: search, mode: 'insensitive' } : undefined,
        },
      })
      .withPages({ limit, page, includePageCount: true });

    return {
      data: routes.map((r: RouteDto) => transformResponse(RouteDto, r)),
      meta,
    };
  }

  async findById(routeId: string): Promise<RouteDto> {
    const route = await this.prismaService.client.route.findUnique({
      where: { routeId },
    });
    if (!route) {
      throw new NotFoundException(`Route with ID ${routeId} not found`);
    }
    return transformResponse(RouteDto, route);
  }

  async update(routeId: string, data: UpdateRouteDto): Promise<RouteDto> {
    const existing = await this.prismaService.client.route.findUnique({
      where: { routeId },
    });
    if (!existing) {
      throw new NotFoundException(`Route with ID ${routeId} not found`);
    }
    if (isNoChange<UpdateRouteDto>(data, existing)) {
      throw new BadRequestException(`No changes detected for route ${routeId}`);
    }
    const route = await this.prismaService.client.route.update({
      where: { routeId },
      data,
    });
    return transformResponse(RouteDto, route);
  }
}
