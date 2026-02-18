import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PagingResultDto } from 'lib/dto/genericPagingResultDto';
import { CategoryDto } from './dto/category.dto';
import { transformResponse } from 'lib/utils/transform';
import { CreateCategoryDto } from './dto/create-category.dto';
import { isNoChange } from 'lib/utils/isNoChange';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { PrismaService } from 'src/prisma.service';

@Injectable()
export class CategoriesRepository {
  constructor(
    // ✅ use `ExtendedPrismaClient` type for correct type-safety of your extended PrismaClient
    private readonly prisma: PrismaService,
  ) {}

  async findAll(
    limit: number = 10,
    page: number = 1,
    search?: string,
  ): Promise<PagingResultDto<CategoryDto>> {
    const [categories, meta] = await this.prisma.db.category
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
    const category = await this.prisma.db.category.findUnique({
      where: { categoryId },
    });
    if (!category) {
      throw new NotFoundException(`Category  not found`);
    }
    return transformResponse(CategoryDto, category);
  }

  async findByName(name: string): Promise<CategoryDto> {
    const category = await this.prisma.db.category.findFirst({
      where: { name },
    });

    if (!category) {
      throw new NotFoundException(`Category not found`);
    }
    return transformResponse(CategoryDto, category);
  }

  async create(data: CreateCategoryDto): Promise<CategoryDto> {
    const existingCategory = await this.prisma.db.category.findUnique({
      where: { name: data.name },
    });

    if (existingCategory) {
      throw new NotFoundException(
        `Category with name ${data.name} already exists`,
      );
    }

    const category = await this.prisma.db.category.create({
      data,
    });
    return transformResponse(CategoryDto, category);
  }

  async update(
    categoryId: string,
    data: UpdateCategoryDto,
  ): Promise<UpdateCategoryDto> {
    const existingCategory = await this.prisma.db.category.findUnique({
      where: { categoryId },
    });

    if (!existingCategory) {
      throw new NotFoundException(`Category with ID ${categoryId} not found`);
    }

    if (data.name && data.name !== existingCategory.name) {
      const nameConflict = await this.prisma.db.category.findUnique({
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
    const category = await this.prisma.db.category.update({
      where: { categoryId },
      data,
    });
    return transformResponse(CategoryDto, category);
  }
}
