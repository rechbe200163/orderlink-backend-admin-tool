import {
  BadRequestException,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Inject,
  Injectable,
} from '@nestjs/common';
import { CustomPrismaService } from 'nestjs-prisma/dist/custom';
import { ExtendedPrismaClient } from 'prisma/prisma.extension';
import { JwtPayload } from '../auth.service';

@Injectable()
export class MaxEmployeeGuard implements CanActivate {
  constructor(
    @Inject('PrismaService')
    private prismaService: CustomPrismaService<ExtendedPrismaClient>,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest();
    const employee = req.user;
    const method = req.method;

    // Only run on POST requests
    if (method !== 'POST') {
      return true;
    }

    const tenantData = await this.prismaService.client.tenantData.findFirst({});

    if (!tenantData) {
      throw new ForbiddenException('Tenant data not found');
    }

    const currentEmployees = await this.prismaService.client.employees.count();

    if (currentEmployees >= tenantData.maxEmployees) {
      throw new BadRequestException('Maximum employee limit reached');
    }

    return true;
  }
}
