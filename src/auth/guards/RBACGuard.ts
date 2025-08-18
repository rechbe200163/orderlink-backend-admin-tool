import {
  CanActivate,
  ExecutionContext,
  Injectable,
  ForbiddenException,
  Inject,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { FastifyRequest } from 'fastify';
import { CustomPrismaService } from 'nestjs-prisma';
import { ExtendedPrismaClient } from 'prisma/prisma.extension';
import { Actions } from '@prisma/client';
import { Resources } from '../../rbac/resources.enum';
import { TypedEventEmitter } from 'src/event-emitter/typed-event-emitter.class';
import { JwtPayload } from '../auth.service';
import { FastifyUserRequest } from 'lib/types';

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    @Inject('PrismaService')
    private prismaService: CustomPrismaService<ExtendedPrismaClient>,
    private readonly eventEmitter: TypedEventEmitter,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest<FastifyUserRequest>();
    const employee = req.user;

    const method = req.method;
    const handler = context.getHandler();
    const controller = context.getClass();

    const resource =
      this.reflector.get<Resources>('resource', handler) ||
      this.reflector.get<Resources>('resource', controller);

    console.log(
      `Checking permissions for user: ${employee?.email}, method: ${method}, resource: ${resource}, role: ${employee?.role}, superAdmin: ${employee?.superAdmin}`,
    );

    if (!employee || !employee.role || !resource) {
      throw new ForbiddenException('Missing user role or resource.');
    }

    if (employee.superAdmin) {
      return true;
    }

    const action = this.mapMethodToAction(method);
    if (!action) {
      throw new ForbiddenException('Unsupported HTTP method.');
    }

    // Wichtig: Suche permission anhand role, action und resource
    const permission = await this.prismaService.client.permission.findUnique({
      where: {
        role_action_resource: {
          role: employee.role,
          action: action,
          resource: resource,
        },
      },
    });

    if (!permission || !permission.allowed) {
      // Emit an event for access violation
      this.eventEmitter.emit('access-violation', {
        employeeId: employee.employeeId,
        firstName: employee.firstName || '',
        lastName: employee.lastName,
        email: employee.email,
        role: employee.role,
        resource: resource,
        action: action,
      });
      throw new ForbiddenException(
        `Role "${employee.role}" is not allowed to ${action} ${resource}`,
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
