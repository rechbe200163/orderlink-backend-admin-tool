import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { transformResponse } from 'lib/utils/transform';
import { CustomPrismaService } from 'nestjs-prisma';
import { ExtendedPrismaClient } from 'prisma/prisma.extension';
import { CreateRoleDto } from 'prisma/src/generated/dto/create-role.dto';
import { CustomerDto } from 'src/customers/dto/customer.dto';
import { RoleDto } from 'prisma/src/generated/dto/role.dto';
import { UpdateRoleDto } from 'prisma/src/generated/dto/update-role.dto';

@Injectable()
export class RolesRepository {
  constructor(
    // ✅ use `ExtendedPrismaClient` type for correct type-safety of your extended PrismaClient
    @Inject('PrismaService')
    private prismaService: CustomPrismaService<ExtendedPrismaClient>,
  ) {}

  async create(tenantId: string, roleData: CreateRoleDto) {
    const existingRole = await this.prismaService.client.role.findByName(
      tenantId,
      roleData.name,
    );
    if (existingRole) {
      throw new BadRequestException(
        `Role with name ${roleData.name} already exists`,
      );
    }
    const createdRole = await this.prismaService.client.role.create({
      data: { ...roleData, tenantId },
    });
    return transformResponse(RoleDto, createdRole);
  }

  async findByName(tenantId: string, name: string) {
    const role = await this.prismaService.client.role.findByName(
      tenantId,
      name,
    );
    if (!role) {
      throw new NotFoundException(`Role not found`);
    }
    return transformResponse(RoleDto, role);
  }

  async findAllRoleNames(tenantId: string) {
    const roles = await this.prismaService.client.role.findMany({
      where: { tenantId },
      select: { name: true },
    });
    return roles.map((role) => role.name);
  }

  async findAll(
    tenantId: string,
    limit: number = 10,
    page: number = 1,
    search: string = '',
  ) {
    const [roles, meta] = await this.prismaService.client.role
      .paginate({
        where: {
          tenantId,
          deleted: false,
          name: {
            contains: search,
            mode: 'insensitive',
          },
        },
      })
      .withPages({
        limit: limit,
        page: page,
        includePageCount: true, // Include total page count
      });

    return {
      data: roles.map((role: RoleDto) => transformResponse(RoleDto, role)),
      meta,
    };
  }

  async update(tenantId: string, name: string, roleData: UpdateRoleDto) {
    const existingRole = await this.prismaService.client.role.findUnique({
      where: { tenantId_name: { tenantId, name } },
    });
    if (!existingRole) {
      throw new NotFoundException(`Role not found`);
    }
    const updatedRole = await this.prismaService.client.role.update({
      where: { tenantId_name: { tenantId, name } },
      data: roleData,
    });
    return transformResponse(RoleDto, updatedRole);
  }
}
