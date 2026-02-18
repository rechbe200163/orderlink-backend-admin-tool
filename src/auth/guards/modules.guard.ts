import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Inject,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { MODULE_KEY } from 'lib/decorators/module.decorators';
import { ModuleEnum } from 'src/site-config/dto/modules-entity.dto';

import { PrismaService } from 'src/prisma.service';

@Injectable()
export class ModulesGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private readonly prisma: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const handler = context.getHandler();
    const classRef = context.getClass();

    const module =
      this.reflector.get<ModuleEnum>(MODULE_KEY, handler) ??
      this.reflector.get<ModuleEnum>(MODULE_KEY, classRef);

    if (!module) {
      return true; // No module specified, allow access
    }

    // Get enabled modules from database
    const enabledModules = await this.prisma.db.enabledModule.findMany({
      select: { moduleName: true },
    });

    const allowedModules = enabledModules.map((m) => m.moduleName);

    const hasAccess = allowedModules.includes(module);

    if (!hasAccess) {
      throw new ForbiddenException('You do not have access to this module.');
    }

    return true;
  }
}
