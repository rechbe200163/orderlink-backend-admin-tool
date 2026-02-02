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
    // No employee limit enforcement - allow all requests
    return true;
  }
}
