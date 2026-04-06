import { ExtendedPrismaClient } from 'src/tenant-prisma.service';

export class TenantDbContext {
  constructor(
    public readonly tenantId: string,
    public readonly dbUrl: string,
    public readonly prisma: ExtendedPrismaClient,
  ) {}
}
