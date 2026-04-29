import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { transformResponse } from 'lib/utils/transform';
import { PRISMA_CLIENT } from 'lib/providers/prisma-client.provider';
import { CreateResourceDto } from './dto/create-resource.dto';
import { ResourceEntity } from './entities/resource.entity';
import { UpdateResourceDto } from './dto/update-resource.dto';
import { TenantDbContext } from 'lib/tenant-db-context';

@Injectable()
export class ResourceRepository {
  constructor(
    // ✅ use `ExtendedPrismaClient` type for correct type-safety of your extended PrismaClient
    private readonly db: TenantDbContext,
  ) {}

  async create(resourceData: CreateResourceDto) {
    console.log('Creating resource with data:', resourceData);
    const existingResource = await this.db.prisma.resource.findUnique({
      where: { key: resourceData.key },
    });
    if (existingResource) {
      throw new BadRequestException(
        `Resource with key ${resourceData.key} already exists`,
      );
    }
    const createdResource = await this.db.prisma.resource.create({
      data: {
        key: resourceData.key,
        description: resourceData.description,
      },
    });
    return transformResponse(ResourceEntity, createdResource);
  }

  async findById(resourceId: string) {
    const resource = await this.db.prisma.resource.findUnique({
      where: { id: resourceId },
    });
    if (!resource) {
      throw new NotFoundException(`Resource not found`);
    }
    return transformResponse(ResourceEntity, resource);
  }

  async findAllRoleNames() {
    const roles = await this.db.prisma.resource.findMany({
      select: { key: true },
    });
    return roles.map((role) => role.key);
  }

  async findAll(limit: number = 10, page: number = 1, search: string = '') {
    const [resources, meta] = await this.db.prisma.resource
      .paginate({
        where: {
          deleted: false,
          key: {
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
      data: resources.map((resource) =>
        transformResponse(ResourceEntity, resource),
      ),
      meta,
    };
  }

  async update(key: string, resourceData: UpdateResourceDto) {
    const existingResource = await this.db.prisma.resource.findUnique({
      where: { key },
    });
    if (!existingResource) {
      throw new NotFoundException(`Resource not found`);
    }
    const updatedResource = await this.db.prisma.resource.update({
      where: { key },
      data: resourceData,
    });
    return transformResponse(ResourceEntity, updatedResource);
  }
}
