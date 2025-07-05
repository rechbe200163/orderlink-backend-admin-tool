import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PagingResultDto } from 'lib/dto/genericPagingResultDto';
import { CustomPrismaService } from 'nestjs-prisma';
import { ExtendedPrismaClient } from 'prisma/prisma.extension';
import { CategoryDto } from './dto/category.dto';
import { transformResponse } from 'lib/utils/transform';
import { CreateCategoryDto } from './dto/create-category.dto';
import { isNoChange } from 'lib/utils/isNoChange';
import { UpdateCategoryDto } from './dto/update-category.dto';

@Injectable()
export class CategoriesRepository {
  constructor(
    // ✅ use `ExtendedPrismaClient` type for correct type-safety of your extended PrismaClient
    @Inject('PrismaService')
    private prismaService: CustomPrismaService<ExtendedPrismaClient>,
  ) {}

  async findAll(
    limit: number = 10,
    page: number = 1,
    search?: string,
  ): Promise<PagingResultDto<CategoryDto>> {
    const [categories, meta] = await this.prismaService.client.category
      .paginate({
        where: {
          name: search ? { contains: search } : undefined,
        },
      })
      .withPages({
        limit,
        page,
        includePageCount: true,
      });
    return {
      data: categories.map((category: CategoryDto) =>
        transformResponse(CategoryDto, category),
      ),
      meta,
    };
  }

  async findById(categoryId: string): Promise<CategoryDto> {
    const category = await this.prismaService.client.category.findUnique({
      where: { categoryId },
    });
    if (!category) {
      throw new NotFoundException(`Category  not found`);
    }
    return transformResponse(CategoryDto, category);
  }

  async findByName(name: string): Promise<CategoryDto> {
    const category = await this.prismaService.client.category.findFirst({
      where: { name },
    });

    if (!category) {
      throw new NotFoundException(`Category not found`);
    }
    return transformResponse(CategoryDto, category);
  }

  async create(data: CreateCategoryDto): Promise<CategoryDto> {
    const existingCategory =
      await this.prismaService.client.category.findUnique({
        where: { name: data.name },
      });

    if (existingCategory) {
      throw new NotFoundException(
        `Category with name ${data.name} already exists`,
      );
    }

    const category = await this.prismaService.client.category.create({
      data,
    });
    return transformResponse(CategoryDto, category);
  }

  async update(
    categoryId: string,
    data: UpdateCategoryDto,
  ): Promise<UpdateCategoryDto> {
    const existingCategory =
      await this.prismaService.client.category.findUnique({
        where: { categoryId },
      });

    if (!existingCategory) {
      throw new NotFoundException(`Category with ID ${categoryId} not found`);
    }

    if (data.name && data.name !== existingCategory.name) {
      const nameConflict = await this.prismaService.client.category.findUnique({
        where: { name: data.name },
      });

      if (nameConflict && nameConflict.categoryId !== categoryId) {
        throw new BadRequestException(
          `Category with name ${data.name} already exists`,
        );
      }
    }

    if (isNoChange<UpdateCategoryDto>(data, existingCategory)) {
      throw new BadRequestException(
        `No changes detected for category ${categoryId}`,
      );
    }
    const category = await this.prismaService.client.category.update({
      where: { categoryId },
      data,
    });
    return transformResponse(CategoryDto, category);
  }
}
