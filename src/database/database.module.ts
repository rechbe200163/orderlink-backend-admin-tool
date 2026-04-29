import { Global, Module } from '@nestjs/common';
import { TenantDbContext } from 'lib/tenant-db-context';
import { PrismaService } from 'src/prisma.service';

@Global()
@Module({
  providers: [PrismaService, TenantDbContext],
  exports: [PrismaService, TenantDbContext],
})
export class DatabaseModule {}
