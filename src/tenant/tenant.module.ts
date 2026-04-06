import { Module } from '@nestjs/common';
import { TenantRepository } from './tenant.repository';
import { PrismaService } from 'src/master-db-prisma.service';

@Module({
  providers: [TenantRepository, PrismaService],
  exports: [TenantRepository],
})
export class TenantModule {}
