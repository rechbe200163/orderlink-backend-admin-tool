import {
  CanActivate,
  ExecutionContext,
  Inject,
  Injectable,
} from '@nestjs/common';
import type { ExtendedPrismaClient } from 'src/tenant-prisma.service';
import { PRISMA_CLIENT } from 'lib/providers/prisma-client.provider';
import { TenantDbContext } from 'lib/tenant-db-context';

@Injectable()
export class MaxEmployeeGuard implements CanActivate {
  constructor(private readonly db: TenantDbContext) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // No employee limit enforcement - allow all requests
    return true;
  }
}
