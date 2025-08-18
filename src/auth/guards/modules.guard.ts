import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ModuleEnum } from 'src/tenants/dto/modules-entity.dto';
import { TenantsService } from 'src/tenants/tenants.service';
import { FastifyRequest } from 'fastify';
import { MODULE_KEY } from 'lib/decorators/module.decorators';
import { FastifyUserRequest } from 'lib/types';
import { JwtPayload } from '../auth.service';

@Injectable()
export class ModulesGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private readonly tenantService: TenantsService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest<FastifyUserRequest>();
    const employee = req.user as JwtPayload;

    console.log(
      `Checking module access for user: ${employee?.email}, tenantId: ${employee?.tenantId}`,
    );
    const handler = context.getHandler();
    const classRef = context.getClass();

    const module =
      this.reflector.get<ModuleEnum>(MODULE_KEY, handler) ??
      this.reflector.get<ModuleEnum>(MODULE_KEY, classRef);

    if (!module) {
      return true; // No module specified, allow access
    }

    // Check if the user has access to the specified module
    const tenant = await this.tenantService.getTenantById(employee.tenantId);

    const allowedModules = tenant.enabledModules.map(
      (module) => module.moduleName,
    );

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
