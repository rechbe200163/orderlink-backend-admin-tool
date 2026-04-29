import { Global, Module, Scope } from '@nestjs/common';
import { TenantDbContext } from 'lib/tenant-db-context';
import { PrismaService } from 'src/prisma.service';

@Global()
@Module({
  providers: [
    PrismaService,
    {
      provide: TenantDbContext,
      scope: Scope.REQUEST,
      inject: [PrismaService],
      useFactory: (prisma: PrismaService) => {
        return new TenantDbContext(prisma.client);
      },
    },
  ],
  exports: [PrismaService, TenantDbContext],
})
export class DatabaseModule {}
