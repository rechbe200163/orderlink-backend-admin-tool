import {
  Injectable,
} from '@nestjs/common';

import { PagingResultDto } from 'lib/dto/genericPagingResultDto';
import { TenantDbContext } from 'lib/tenant-db-context';

// TODO: PAGINATION, SORTING, FILTERING

@Injectable()
export class RoutesOrdersRepository {
  constructor(private readonly db: TenantDbContext) {}

  async findAllOrdersbyRouteId(
    limit = 10,
    page = 1,
    routeId: string,
    sort,
    order
  ): Promise<
    PagingResultDto<any>
  > {
    const [orders, meta] = await this.db.prisma.order.paginate({
        where: {
          route: {
            some: {
              routeId,
            },
          },
        },
        include: {
          customer: true,
          products: {
            include: {
              product: true,
            },
          },
        },
         orderBy: sort
          ? {
              [sort]: order ? order : 'asc',
            }
          : undefined,
      }).withPages({
        limit,
        page,
        includePageCount: true,
      });

      console.log(
        'Found orders:',
        JSON.stringify(orders, null, 2),
        'with meta:',
        meta,
      );

      const data = orders;
      console.log(orders)

    return {
      data,
      meta,
    };
  }
}
