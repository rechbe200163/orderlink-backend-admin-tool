import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from 'generated/client';
import { pagination } from 'prisma-extension-pagination';

function createPrisma(databaseUrl: string) {
  const adapter = new PrismaPg({
    connectionString: databaseUrl,
    // optional: näher an v6-Verhalten
    connectionTimeoutMillis: 5_000,
    idleTimeoutMillis: 300_000,
  });

  return new PrismaClient({ adapter }).$extends(pagination());
}

export type ExtendedPrismaClient = ReturnType<typeof createPrisma>;

@Injectable()
export class PrismaService extends PrismaClient {
  constructor(config: ConfigService) {
    const url = config.getOrThrow<string>('DATABASE_URL');

    const adapter = new PrismaPg({
      connectionString: url,
    });

    super({ adapter });

    this.$extends(pagination());
  }
}
