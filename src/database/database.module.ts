import { Global, Module, Scope } from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import { TenantDbContext } from 'lib/tenant-db-context';
import { TenantPrismaService } from 'src/tenant-prisma.service';
import { PrismaService } from 'src/master-db-prisma.service';
import { TenantRequest } from 'src/middlewares/tenant.middleware';
import { TenantModule } from 'src/tenant/tenant.module';

@Global()
@Module({
  imports: [TenantModule],
  providers: [
    PrismaService,
    TenantPrismaService,
    {
      provide: TenantDbContext,
      scope: Scope.REQUEST,
      inject: [REQUEST, TenantPrismaService],
      useFactory: async (
        req: TenantRequest,
        tenantPrisma: TenantPrismaService,
      ) => {
        const tenantId = req.tenantId;
        const dbUrl = req.tenantDbUrl;

        if (!tenantId || !dbUrl) {
          throw new Error('Tenant context missing');
        }

        const prisma = tenantPrisma.getClient(dbUrl);

        return new TenantDbContext(tenantId, dbUrl, prisma);
      },
    },
  ],
  exports: [PrismaService, TenantPrismaService, TenantDbContext],
})
export class DatabaseModule {}
