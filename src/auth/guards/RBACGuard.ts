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
const RESOURCE_ID_KEY = (resourceKey: string) =>
  `rbac:resourceId:${resourceKey}:v1`;

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
    if (employee.superAdmin) return true;

    const handler = context.getHandler();
    const controller = context.getClass();

    // resourceKey ist dein Enum/String z.B. "ROLE" / "CUSTOMER"
    const resourceKey =
      this.reflector.get<Resources>('resource', handler) ||
      this.reflector.get<Resources>('resource', controller);

    if (!employee.roleId || !resourceKey) {
      throw new ForbiddenException('Resource not defined for this route.');
    }

    // 0) resourceId aus Cache, sonst DB -> Cache
    let resourceId = await this.cache.get<string>(RESOURCE_ID_KEY(resourceKey));
    if (!resourceId) {
      const row = await this.prisma.db.resource.findUnique({
        where: { key: resourceKey }, // <- deine Resource Tabelle hat "key" = "ROLE"/"CUSTOMER"/...
        select: { id: true },
      });

      if (!row) {
        throw new ForbiddenException(`Unknown resource "${resourceKey}"`);
      }

      resourceId = row.id;

      // sehr lang cachen, weil stabil
      await this.cache.set(
        RESOURCE_ID_KEY(resourceKey),
        resourceId,
        60 * 60 * 24 * 7, // 7 Tage
      );
    }

    // 1) Actions aus Cache, sonst DB -> Cache
    let actions = await this.cache.get<Action[]>(ACTIONS_KEY);
    if (!actions) {
      actions = await this.prisma.db.action.findMany();
      await this.cache.set(ACTIONS_KEY, actions, 60 * 60 * 24); // 24h
    }

    // 2) Permissions pro Role aus Cache, sonst DB -> Cache
    let permissions = await this.cache.get<
      { resourceId: string; actionId: string; allowed: boolean }[]
    >(ROLE_PERMS_KEY(employee.roleId));

    if (!permissions) {
      permissions = await this.prisma.db.permission.findMany({
        where: { roleId: employee.roleId },
        select: { resourceId: true, actionId: true, allowed: true },
      });
      await this.cache.set(
        ROLE_PERMS_KEY(employee.roleId),
        permissions,
        60, // 60s
      );
    }

    // 3) Action für HTTP Method bestimmen
    const actionKey = this.httpMethodToActionKey(req.method);
    const action = actions.find((a) => a.key === actionKey);
    if (!action) throw new ForbiddenException('Unsupported HTTP method.');

    // 4) Permission check: UUID vs UUID (korrekt!)
    const allowed = permissions.some(
      (p) =>
        p.allowed === true &&
        p.resourceId === resourceId &&
        p.actionId === action.id,
    );

    if (!allowed) {
      this.eventEmitter.emit('access-violation', {
        employeeId: employee.employeeId,
        firstName: employee.firstName || '',
        lastName: employee.lastName,
        email: employee.email,
        role: employee.roleId,
        resource: resourceKey,
        action: action.key,
      });

      throw new ForbiddenException(
        `Role "${employee.roleId}" is not allowed to ${action.key} ${resourceKey}`,
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
        return 'READ';
    }
  }
}
