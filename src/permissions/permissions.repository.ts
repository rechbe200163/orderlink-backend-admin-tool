import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { CustomPrismaService } from 'nestjs-prisma';
import { ExtendedPrismaClient } from 'prisma/prisma.extension';
import { PermissionPagingResultDto } from './dto/permissions-paging';
import { transformResponse } from 'lib/utils/transform';
import { PermissionDto } from 'prisma/src/generated/dto/permission.dto';
import { CreatePermissionDto } from 'prisma/src/generated/dto/create-permission.dto';
import { UpdatePermissionDto } from 'prisma/src/generated/dto/update-permission.dto';
import { CustomerDto } from 'src/customers/dto/customer.dto';
import { Actions, Ressources } from '@prisma/client';
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
    limit?: number,
    page?: number,
    role?: string,
  ): Promise<PermissionPagingResultDto> {
    const [permissions, meta] = await this.prismaService.client.permission
      .paginate({
        where: {
          role: role ? role : undefined,
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
    const permissions = await this.prismaService.client.permission.findMany({
      where: {
        role: role ? role : undefined,
      },
    });

    return permissions.map((permission) =>
      transformResponse(PermissionDto, permission),
    );
  }

  async findById(id: string): Promise<PermissionDto> {
    const permission = await this.prismaService.client.permission.findUnique({
      where: { id },
    });
    if (!permission) {
      throw new Error(`Permission with ID ${id} not found`);
    }
    return transformResponse(PermissionDto, permission);
  }

  async create(permissionData: CreatePermissionDto): Promise<PermissionDto> {
    // check if the permissionData.resource is in Ressources enum

    if (!Object.values(Actions).includes(permissionData.action)) {
      throw new BadRequestException(
        `Invalid action type: ${permissionData.action}. Must be one of ${Object.values(Actions).join(', ')}`,
      );
    }

    if (!Object.values(Ressources).includes(permissionData.resource)) {
      throw new BadRequestException(
        `Invalid resource type: ${permissionData.resource}. Must be one of ${Object.values(Ressources).join(', ')}`,
      );
    }

    // check if the role exists
    const roleExists = await this.rolesRepository.findByName(
      permissionData.role,
    );

    if (!roleExists) {
      throw new BadRequestException(
        `Role with name ${permissionData.role} does not exist`,
      );
    }

    // check if the permission already exists
    const existingPermission =
      await this.prismaService.client.permission.findFirst({
        where: {
          action: permissionData.action,
          resource: permissionData.resource,
          role: permissionData.role,
        },
      });

    if (existingPermission) {
      throw new BadRequestException(
        `Permission with action ${permissionData.action}, resource ${permissionData.resource}, and role ${permissionData.role} already exists`,
      );
    }

    const createdPermission = await this.prismaService.client.permission.create(
      {
        data: permissionData,
      },
    );
    return transformResponse(PermissionDto, createdPermission);
  }

  async update(
    id: string,
    permissionData: Partial<UpdatePermissionDto>,
  ): Promise<PermissionDto> {
    const updatedPermission = await this.prismaService.client.permission.update(
      {
        where: { id },
        data: permissionData,
      },
    );
    return transformResponse(PermissionDto, updatedPermission);
  }
}
