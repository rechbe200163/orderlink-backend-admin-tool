import {
  CanActivate,
  ExecutionContext,
  Injectable,
  ForbiddenException,
  Inject,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';
import { CustomPrismaService } from 'nestjs-prisma';
import { ExtendedPrismaClient } from 'prisma/prisma.extension';
import { SanitizedEmployee } from '../../../lib/types';
import { Actions, Ressources } from '@prisma/client';

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    @Inject('PrismaService')
    private prismaService: CustomPrismaService<ExtendedPrismaClient>,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest<Request>();
    const user = req.user as SanitizedEmployee;

    const method = req.method;
    const handler = context.getHandler();
    const controller = context.getClass();

    const resource =
      this.reflector.get<Ressources>('resource', handler) ||
      this.reflector.get<Ressources>('resource', controller);

    console.log(
      `Checking permissions for user: ${user?.email}, method: ${method}, resource: ${resource}, role: ${user?.role}`,
    );

    if (!user || !user.role || !resource) {
      throw new ForbiddenException('Missing user role or resource.');
    }

    const action = this.mapMethodToAction(method);
    if (!action) {
      throw new ForbiddenException('Unsupported HTTP method.');
    }

    // Wichtig: Suche permission anhand role, action und resource
    const permission = await this.prismaService.client.permission.findUnique({
      where: {
        role_action_resource: {
          role: user.role,
          action: action,
          resource: resource,
        },
      },
    });

    if (!permission || !permission.allowed) {
      throw new ForbiddenException(
        `Role "${user.role}" is not allowed to ${action} ${resource}`,
      );
    }

    return true;
  }

  private mapMethodToAction(method: string): Actions | null {
    switch (method.toUpperCase()) {
      case 'GET':
        return Actions.READ;
      case 'POST':
        return Actions.CREATE;
      case 'PUT':
      case 'PATCH':
        return Actions.UPDATE;
      case 'DELETE':
        return Actions.DELETE;
      default:
        return null;
    }
  }
}
