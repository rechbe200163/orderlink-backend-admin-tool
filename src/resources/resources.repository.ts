import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { transformResponse } from 'lib/utils/transform';
import { PrismaService } from 'src/prisma.service';
import { CreateResourceDto } from './dto/create-resource.dto';
import { ResourceEntity } from './entities/resource.entity';
import { UpdateResourceDto } from './dto/update-resource.dto';

@Injectable()
export class ResourceRepository {
  constructor(
    // ✅ use `ExtendedPrismaClient` type for correct type-safety of your extended PrismaClient
    private readonly prisma: PrismaService,
  ) {}

  async create(resourceData: CreateResourceDto) {
    const existingResource = await this.prisma.db.resource.findUnique({
      where: { key: resourceData.key },
    });
    if (existingResource) {
      throw new BadRequestException(
        `Resource with key ${resourceData.key} already exists`,
      );
    }
    const createdResource = await this.prisma.db.resource.create({
      data: resourceData,
    });
    return transformResponse(ResourceEntity, createdResource);
  }

  async findById(resourceId: string) {
    const resource = await this.prisma.db.resource.findUnique({
      where: { id: resourceId },
    });
    if (!resource) {
      throw new NotFoundException(`Resource not found`);
    }
    return transformResponse(ResourceEntity, resource);
  }

  async findAllRoleNames() {
    const roles = await this.prisma.db.resource.findMany({
      select: { key: true },
    });
    return roles.map((role) => role.key);
  }

  async findAll(limit: number = 10, page: number = 1, search: string = '') {
    const [resources, meta] = await this.prisma.db.resource
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
    const existingResource = await this.prisma.db.resource.findUnique({
      where: { key },
    });
    if (!existingResource) {
      throw new NotFoundException(`Resource not found`);
    }
    const updatedResource = await this.prisma.db.resource.update({
      where: { key },
      data: resourceData,
    });
    return transformResponse(ResourceEntity, updatedResource);
  }
}
