import {
  CanActivate,
  ExecutionContext,
  Injectable,
  ForbiddenException,
  Inject,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Resources } from '../../rbac/resources.enum';
import { TypedEventEmitter } from 'src/event-emitter/typed-event-emitter.class';
import { JwtPayload } from '../auth.service';
import { FastifyUserRequest } from 'lib/types';
import { PrismaService } from 'src/prisma.service';
import { Action } from 'generated/prisma/client';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { Cache } from 'cache-manager';

const ACTIONS_KEY = 'rbac:actions:v1';
const ROLE_PERMS_KEY = (roleId: string) => `rbac:perms:role:${roleId}:v1`;

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private readonly prisma: PrismaService,
    private readonly eventEmitter: TypedEventEmitter,
    @Inject(CACHE_MANAGER) private cache: Cache,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest<FastifyUserRequest>();
    const employee = req.user as JwtPayload;

    if (!employee) {
      throw new ForbiddenException('Missing user role or resource.');
    }

    if (employee.superAdmin) {
      return true;
    }

    const method = req.method;
    const handler = context.getHandler();
    const controller = context.getClass();
    const resource =
      this.reflector.get<Resources>('resource', handler) ||
      this.reflector.get<Resources>('resource', controller);

    if (!employee.roleId || !resource) {
      throw new ForbiddenException('Resource not defined for this route.');
    }

    // 1) Actions aus Cache, sonst DB -> Cache
    let actions = (await this.cache.get<Action[]>(ACTIONS_KEY)) ?? null;
    if (!actions) {
      actions = await this.prisma.db.action.findMany();
      await this.cache.set(ACTIONS_KEY, actions, 60 * 60); // 1h (seconds)
    }

    // 2) Permissions pro Role aus Cache, sonst DB -> Cache
    let permissions =
      (await this.cache.get<
        { resourceId: string; actionId: string; allowed: boolean }[]
      >(ROLE_PERMS_KEY(employee.roleId))) ?? null;

    if (!permissions) {
      permissions = await this.prisma.db.permission.findMany({
        where: { roleId: employee.roleId },
        select: { resourceId: true, actionId: true, allowed: true },
      });
      await this.cache.set(ROLE_PERMS_KEY(employee.roleId), permissions, 60); // 60s
    }

    // 3) Action für HTTP Method bestimmen (in-memory!)
    const actionKey = this.httpMethodToActionKey(req.method);
    const action = actions!.find((a) => a.key === actionKey);
    if (!action) throw new ForbiddenException('Unsupported HTTP method.');

    // 4) Permission in-memory checken (kein DB roundtrip)
    const allowed = permissions!.some(
      (p) =>
        p.allowed === true &&
        p.resourceId === resource &&
        p.actionId === action.id,
    );

    if (!allowed) {
      this.eventEmitter.emit('access-violation', {
        employeeId: employee.employeeId,
        firstName: employee.firstName || '',
        lastName: employee.lastName,
        email: employee.email,
        role: employee.roleId,
        resource,
        action: action.key,
      });
      throw new ForbiddenException(
        `Role "${employee.roleId}" is not allowed to ${action.key} ${resource}`,
      );
    }

    return true;
  }

  private httpMethodToActionKey(
    method: string,
  ): 'READ' | 'CREATE' | 'UPDATE' | 'DELETE' {
    switch (method.toUpperCase()) {
      case 'GET':
        return 'READ';
      case 'POST':
        return 'CREATE';
      case 'PUT':
      case 'PATCH':
        return 'UPDATE';
      case 'DELETE':
        return 'DELETE';
      default:
        // du kannst hier auch eine Exception werfen statt default
        return 'READ';
    }
  }
}
