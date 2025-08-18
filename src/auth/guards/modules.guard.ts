import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  Inject,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ModuleEnum } from '@prisma/client';
import { CustomPrismaService } from 'nestjs-prisma';
import { ExtendedPrismaClient } from 'prisma/prisma.extension';
import { MODULE_KEY } from 'lib/decorators/module.decorators';
import { FastifyUserRequest } from 'lib/types';
import { JwtPayload } from '../auth.service';

@Injectable()
export class ModulesGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    @Inject('PrismaService')
    private readonly prismaService: CustomPrismaService<ExtendedPrismaClient>,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest<FastifyUserRequest>();
    const employee = req.user;

    console.log(`Checking module access for user: ${employee?.email}`);
    const handler = context.getHandler();
    const classRef = context.getClass();

    const module =
      this.reflector.get<ModuleEnum>(MODULE_KEY, handler) ??
      this.reflector.get<ModuleEnum>(MODULE_KEY, classRef);

    if (!module) {
      return true; // No module specified, allow access
    }

    // Check if the user has access to the specified module
    const siteConfig = await this.prismaService.client.siteConfig.findFirst({
      select: { enabledModules: true },
    });

    const allowedModules =
      siteConfig?.enabledModules.map((module) => module.moduleName) ?? [];

    console.log(
      `User: ${employee.email} has access to modules: ${allowedModules.join(', ')}`,
    );

    const hasAccess = allowedModules.includes(module);

    if (!hasAccess) {
      throw new ForbiddenException('You do not have access to this module.');
    }

    return true;
  }
}
