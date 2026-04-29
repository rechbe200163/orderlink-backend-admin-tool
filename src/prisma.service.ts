import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from 'generated/client';
import { pagination } from 'prisma-extension-pagination';

function createPrisma(databaseUrl: string) {
  const adapter = new PrismaPg({
    connectionString: databaseUrl,
    connectionTimeoutMillis: 5_000,
    idleTimeoutMillis: 300_000,
  });

  return new PrismaClient({ adapter }).$extends(pagination());
}

export type ExtendedPrismaClient = ReturnType<typeof createPrisma>;

@Injectable()
export class PrismaService implements OnModuleInit, OnModuleDestroy {
  public readonly client: ExtendedPrismaClient;

  constructor(config: ConfigService) {
    const url = config.getOrThrow<string>('DATABASE_URL');
    this.client = createPrisma(url);
  }

  async onModuleInit() {
    await this.client.$connect();
  }

  async onModuleDestroy() {
    await this.client.$disconnect();
  }
}
