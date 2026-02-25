import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from 'generated/prisma/client';
import { pagination } from 'prisma-extension-pagination';

function createPrisma(databaseUrl: string) {
  const adapter = new PrismaPg({ connectionString: databaseUrl });
  return new PrismaClient({ adapter }).$extends(pagination());
}

type PrismaWithPagination = ReturnType<typeof createPrisma>;

@Injectable()
export class PrismaService implements OnModuleInit, OnModuleDestroy {
  public readonly db: PrismaWithPagination;

  constructor(config: ConfigService) {
    const databaseUrl = config.getOrThrow<string>('DATABASE_URL');
    this.db = createPrisma(databaseUrl);
  }

  async onModuleInit() {
    await this.db.$connect();
  }

  async onModuleDestroy() {
    await this.db.$disconnect();
  }
}
