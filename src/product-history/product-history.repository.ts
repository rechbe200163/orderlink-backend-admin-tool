import { Inject, Injectable } from '@nestjs/common';
import { CustomPrismaService } from 'nestjs-prisma';
import { ExtendedPrismaClient } from 'prisma/prisma.extension';
import { EventPayloads } from 'src/event-emitter/interface/event-types.interface';

@Injectable()
export class ProductHistoryRepository {
  constructor(
    @Inject('PrismaService')
    private readonly prisma: CustomPrismaService<ExtendedPrismaClient>,
  ) {}

  async create(data: EventPayloads['product.updated']) {
    await this.prisma.client.productHistory.create({
      data,
    });
  }
}
