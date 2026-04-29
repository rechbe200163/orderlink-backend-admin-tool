import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';

@Injectable()
export class TenantDbContext {
  constructor(public readonly prisma: PrismaService) {}
}
