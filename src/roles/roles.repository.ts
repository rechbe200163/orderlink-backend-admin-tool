import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { transformResponse } from 'lib/utils/transform';

import { CreateRoleDto } from 'prisma/src/generated/dto/create-role.dto';
import { RoleDto } from 'prisma/src/generated/dto/role.dto';
import { UpdateRoleDto } from 'prisma/src/generated/dto/update-role.dto';
import { PrismaService } from 'src/prisma.service';

@Injectable()
export class RolesRepository {
  constructor(
    // ✅ use `ExtendedPrismaClient` type for correct type-safety of your extended PrismaClient
    private readonly prisma: PrismaService,
  ) {}

  async create(roleData: CreateRoleDto) {
    const existingRole = await this.prisma.db.role.findUnique({
      where: { name: roleData.name },
    });
    if (existingRole) {
      throw new BadRequestException(
        `Role with name ${roleData.name} already exists`,
      );
    }
    const createdRole = await this.prisma.db.role.create({
      data: roleData,
    });
    return transformResponse(RoleDto, createdRole);
  }

  async findById(roleId: string) {
    const role = await this.prisma.db.role.findUnique({
      where: { id: roleId },
    });
    if (!role) {
      throw new NotFoundException(`Role not found`);
    }
    return transformResponse(RoleDto, role);
  }

  async findAllRoleNames() {
    const roles = await this.prisma.db.role.findMany({
      select: { name: true },
    });
    return roles.map((role) => role.name);
  }

  async findAll(limit: number = 10, page: number = 1, search: string = '') {
    const [roles, meta] = await this.prisma.db.role
      .paginate({
        where: {
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

  async update(name: string, roleData: UpdateRoleDto) {
    const existingRole = await this.prisma.db.role.findUnique({
      where: { name },
    });
    if (!existingRole) {
      throw new NotFoundException(`Role not found`);
    }
    const updatedRole = await this.prisma.db.role.update({
      where: { name },
      data: roleData,
    });
    return transformResponse(RoleDto, updatedRole);
  }
}
