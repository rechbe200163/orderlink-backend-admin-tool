import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { PermissionPagingResultDto } from './dto/permissions-paging';
import { transformResponse } from 'lib/utils/transform';
import { PermissionDto } from 'prisma/src/generated/dto/permission.dto';
import { Resources } from '../rbac/resources.enum';
import { RolesRepository } from 'src/roles/roles.repository';
import { PRISMA_CLIENT } from 'lib/providers/prisma-client.provider';
import { CreatePermissionsDto } from './dto/create-permision.dto';
import { UpdatePermissionDto } from './dto/update-permision.dto';
import { ActionsRepository } from 'src/actions/actions.repository';
import { TenantDbContext } from 'lib/tenant-db-context';

@Injectable()
export class PermissionsRepository {
  constructor(
    // ✅ use `ExtendedPrismaClient` type for correct type-safety of your extended PrismaClient
    private readonly db: TenantDbContext,
    private readonly rolesRepository: RolesRepository,
    private readonly actionsRepository: ActionsRepository,
    private readonly rolesRepo: RolesRepository,
  ) {}

  async findAll(
    limit?: number,
    page?: number,
    role?: string,
  ): Promise<PermissionPagingResultDto> {
    const [permissions, meta] = await this.db.prisma.permission
      .paginate({
        where: {
          roleId: role ? role : undefined,
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

  async findAllPermissions(role?: string): Promise<PermissionDto[]> {
    const permissions = await this.db.prisma.permission.findMany({
      where: {
        roleId: role ? role : undefined,
      },
    });

    return permissions.map((permission) =>
      transformResponse(PermissionDto, permission),
    );
  }

  async findById(permissionId: string): Promise<PermissionDto> {
    const permission = await this.db.prisma.permission.findUnique({
      where: {
        id: permissionId,
      },
    });
    if (!permission) {
      throw new Error(`Permission with ID ${permissionId} not found`);
    }
    return transformResponse(PermissionDto, permission);
  }

  async create(dto: CreatePermissionsDto): Promise<PermissionDto> {
    const roleExists = await this.rolesRepo.findById(dto.roleId);
    if (!roleExists) {
      throw new BadRequestException(
        `Role with ID ${dto.roleId} does not exist`,
      );
    }

    const existingPermission = await this.db.prisma.permission.findFirst({
      where: {
        actionId: dto.actionId,
        resourceId: dto.resourceId,
        roleId: dto.roleId,
      },
    });

    if (existingPermission) {
      throw new BadRequestException(
        `Permission with action ${dto.actionId}, resource ${dto.resourceId}, and role ${dto.roleId} already exists`,
      );
    }

    const createdPermission = await this.db.prisma.permission.create({
      data: {
        roleId: dto.roleId,
        resourceId: dto.resourceId,
        actionId: dto.actionId,
        allowed: dto.allowed,
      },
    });
    return transformResponse(PermissionDto, createdPermission);
  }

  async update(
    permissionId: string,
    permissionData: Partial<UpdatePermissionDto>,
  ): Promise<PermissionDto> {
    const updatedPermission = await this.db.prisma.permission.update({
      where: { id: permissionId },
      data: permissionData,
    });
    return transformResponse(PermissionDto, updatedPermission);
  }
}
