import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { transformResponse } from 'lib/utils/transform';
import { RoleDto } from 'prisma/src/generated/dto/role.dto';
import { CreateActionDto } from './dto/create-action.dto';
import { ActionEntity } from './entities/action.entity';
import { UpdateActionDto } from './dto/update-action.dto';
import { SortOrder } from 'src/common/enums/sort-order.enum';
import { TenantDbContext } from 'lib/tenant-db-context';

@Injectable()
export class ActionsRepository {
  constructor(
    // ✅ use `ExtendedPrismaClient` type for correct type-safety of your extended PrismaClient
    private readonly db: TenantDbContext,
  ) {}

  async create(roleData: CreateActionDto) {
    const existingRole = await this.db.prisma.action.findUnique({
      where: { key: roleData.key },
    });
    if (existingRole) {
      throw new BadRequestException(
        `Action with key ${roleData.key} already exists`,
      );
    }
    const createdRole = await this.db.prisma.action.create({
      data: roleData,
    });
    return transformResponse(RoleDto, createdRole);
  }

  async findById(roleId: string) {
    const role = await this.db.prisma.action.findUnique({
      where: { id: roleId },
    });
    if (!role) {
      throw new NotFoundException(`Action not found`);
    }
    return transformResponse(RoleDto, role);
  }

  async findAllRoleNames() {
    const roles = await this.db.prisma.action.findMany({
      select: { key: true },
    });
    return roles.map((role) => role.key);
  }

  async findAll(
    limit: number = 10,
    page: number = 1,
    search: string = '',
    sort?: string,
    order?: SortOrder,
  ) {
    const [actions, meta] = await this.db.prisma.action
      .paginate({
        where: {
          deleted: false,
          key: {
            contains: search,
            mode: 'insensitive',
          },
        },
        orderBy: sort
          ? {
              [sort]: order || 'asc',
            }
          : undefined,
      })
      .withPages({
        limit: limit,
        page: page,
        includePageCount: true, // Include total page count
      });

    return {
      data: actions.map((action) => transformResponse(ActionEntity, action)),
      meta,
    };
  }

  async update(key: string, actionData: UpdateActionDto) {
    const existingRole = await this.db.prisma.action.findUnique({
      where: { key },
    });
    if (!existingRole) {
      throw new NotFoundException(`Action not found`);
    }
    const updatedRole = await this.db.prisma.action.update({
      where: { key },
      data: actionData,
    });
    return transformResponse(ActionEntity, updatedRole);
  }
}
