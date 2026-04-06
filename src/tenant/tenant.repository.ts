import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/master-db-prisma.service';

@Injectable()
export class TenantRepository {
  constructor(
    // ✅ use `ExtendedPrismaClient` type for correct type-safety of your extended PrismaClient
    private readonly prisma: PrismaService,
  ) {}

  async getBySubdomain(subdomain: string) {
    const tenant = await this.prisma.db.tenant.findUnique({
      where: { subdomain: subdomain },
    });
    if (!tenant) {
      throw new NotFoundException(
        `Tenant with subdomain ${subdomain} not found`,
      );
    }
    return tenant;
  }
}
