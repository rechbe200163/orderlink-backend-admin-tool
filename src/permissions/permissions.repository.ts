import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { CustomPrismaService } from 'nestjs-prisma';
import { ExtendedPrismaClient } from 'prisma/prisma.extension';
import { PermissionPagingResultDto } from './dto/permissions-paging';
import { transformResponse } from 'lib/utils/transform';
import { PermissionDto } from 'prisma/src/generated/dto/permission.dto';
import { CreatePermissionDto } from 'prisma/src/generated/dto/create-permission.dto';
import { CreatePermissionsDto } from './dto/create-permissions.dto';
import { UpdatePermissionDto } from 'prisma/src/generated/dto/update-permission.dto';
import { CustomerDto } from 'src/customers/dto/customer.dto';
import { Actions } from '@prisma/client';
import { Resources } from '../../lib/rbac/resources.enum';
import { RolesRepository } from 'src/roles/roles.repository';

@Injectable()
export class PermissionsRepository {
  constructor(
    // ✅ use `ExtendedPrismaClient` type for correct type-safety of your extended PrismaClient
    @Inject('PrismaService')
    private prismaService: CustomPrismaService<ExtendedPrismaClient>,
    private readonly rolesRepository: RolesRepository,
  ) {}

  async findAll(
    tenantId: string,
    limit?: number,
    page?: number,
    role?: string,
  ): Promise<PermissionPagingResultDto> {
    const [permissions, meta] = await this.prismaService.client.permission
      .paginate({
        where: {
          tenantId,
          roleName: role ? role : undefined,
        },
      })
      .withPages({
        limit: limit || 10,
        page: page || 1,
        includePageCount: true,
      });

    return {
      data: permissions.map((permission) =>
        transformResponse(PermissionDto, permission),
      ),
      meta,
    };
  }

  async findAllPermissions(
    tenantId: string,
    role?: string,
  ): Promise<PermissionDto[]> {
    const permissions = await this.prismaService.client.permission.findMany({
      where: {
        tenantId,
        roleName: role ? role : undefined,
      },
    });

    return permissions.map((permission) =>
      transformResponse(PermissionDto, permission),
    );
  }

  async findById(
    tenantId: string,
    permissionId: string,
  ): Promise<PermissionDto> {
    const permission = await this.prismaService.client.permission.findUnique({
      where: {
        permission_tenant_permissionId_unique: {
          tenantId,
          permissionId,
        },
      },
    });
    if (!permission) {
      throw new Error(`Permission with ID ${permissionId} not found`);
    }
    return transformResponse(PermissionDto, permission);
  }

  async create(
    tenantId: string,
    dto: CreatePermissionsDto,
  ): Promise<PermissionDto[]> {
    const results: PermissionDto[] = [];
    for (const action of dto.actions) {
      if (!Object.values(Actions).includes(action)) {
        throw new BadRequestException(
          `Invalid action type: ${action}. Must be one of ${Object.values(Actions).join(', ')}`,
        );
      }

      if (!Object.values(Resources).includes(dto.resource)) {
        throw new BadRequestException(
          `Invalid resource type: ${dto.resource}. Must be one of ${Object.values(Resources).join(', ')}`,
        );
      }

      const roleExists = await this.rolesRepository.findByName(
        tenantId,
        dto.roleName,
      );

      if (!roleExists) {
        throw new BadRequestException(
          `Role with name ${dto.roleName} does not exist`,
        );
      }

      const existingPermission =
        await this.prismaService.client.permission.findUnique({
          where: {
            permission_role_action_resource_unique: {
              tenantId,
              roleName: dto.roleName,
              action,
              resource: dto.resource,
            },
          },
        });

      if (existingPermission) {
        throw new BadRequestException(
          `Permission with action ${action}, resource ${dto.resource}, and role ${dto.roleName} already exists`,
        );
      }

      const createdPermission =
        await this.prismaService.client.permission.create({
          data: {
            tenantId,
            roleName: dto.roleName,
            resource: dto.resource,
            action,
            allowed: dto.allowed,
          },
        });
      results.push(transformResponse(PermissionDto, createdPermission));
    }

    return results;
  }
  async update(
    tenantId: string,
    permissionId: string,
    permissionData: Partial<UpdatePermissionDto>,
  ): Promise<PermissionDto> {
    const updatedPermission = await this.prismaService.client.permission.update(
      {
        where: {
          tenantId_permissionId: {
            tenantId,
            permissionId,
          },
        },
        data: {
          ...permissionData,
          tenantId,
        },
      },
    );
    return transformResponse(PermissionDto, updatedPermission);
  }
}
