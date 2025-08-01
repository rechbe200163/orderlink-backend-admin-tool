import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Inject,
  Injectable,
} from '@nestjs/common';
import { TenantsService } from 'src/tenants/tenants.service';
import { JwtPayload } from '../auth.service';
import { Request } from 'express';
import { CustomPrismaService } from 'nestjs-prisma/dist/custom';
import { ExtendedPrismaClient } from 'prisma/prisma.extension';

@Injectable()
export class MaxEmployeeGuard implements CanActivate {
  constructor(
    @Inject('PrismaService')
    private prismaService: CustomPrismaService<ExtendedPrismaClient>,
    private readonly tenantService: TenantsService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest<Request>();
    const employee = req.user as JwtPayload;
    const method = req.method;

    // Only run on POST requests
    if (method !== 'POST') {
      return true;
    }

    const { maxEmployees } = await this.tenantService.getTenantById(
      employee.tenantId,
    );

    const currentEmployees = await this.prismaService.client.employees.count();

    if (currentEmployees >= maxEmployees) {
      throw new ForbiddenException('Maximum employee limit reached');
    }

    return true;
  }
}
