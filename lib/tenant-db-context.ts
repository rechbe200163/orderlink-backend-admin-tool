import { ExtendedPrismaClient } from 'src/prisma.service';

export class TenantDbContext {
  constructor(public readonly prisma: ExtendedPrismaClient) {}
}
