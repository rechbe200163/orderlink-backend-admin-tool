import { Injectable, OnModuleDestroy } from '@nestjs/common';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from 'generated/prisma/client';
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
export class TenantPrismaService implements OnModuleDestroy {
  private readonly clients = new Map<string, ExtendedPrismaClient>();

  getClient(dbUrl: string): ExtendedPrismaClient {
    let client = this.clients.get(dbUrl);

    if (!client) {
      client = createPrisma(dbUrl);
      this.clients.set(dbUrl, client);
    }

    return client;
  }

  async onModuleDestroy() {
    await Promise.all(
      Array.from(this.clients.values()).map((client) => client.$disconnect()),
    );
  }
}
