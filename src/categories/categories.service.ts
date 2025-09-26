import { Injectable } from '@nestjs/common';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { CategoriesRepository } from './categories.repository';
import { CategoryDto } from './dto/category.dto';
import { PagingResultDto } from 'lib/dto/genericPagingResultDto';

@Injectable()
export class CategoriesService {
  constructor(
    private readonly categoriesRepository: CategoriesRepository, // Assuming you have a repository to handle DB operations
  ) {}

  create(
    tenantId: string,
    createCategoryDto: CreateCategoryDto,
  ): Promise<CreateCategoryDto> {
    return this.categoriesRepository.create(tenantId, createCategoryDto);
  }

  findAll(
    tenantId: string,
    limit: number = 10,
    page: number = 1,
    search?: string,
  ): Promise<PagingResultDto<CategoryDto>> {
    return this.categoriesRepository.findAll(tenantId, limit, page, search);
  }

  findById(tenantId: string, id: string): Promise<CategoryDto> {
    return this.categoriesRepository.findById(tenantId, id);
  }

  findByName(tenantId: string, name: string): Promise<CategoryDto> {
    return this.categoriesRepository.findByName(tenantId, name);
  }

  update(
    tenantId: string,
    id: string,
    updateCategoryDto: UpdateCategoryDto,
  ): Promise<UpdateCategoryDto> {
    return this.categoriesRepository.update(tenantId, id, updateCategoryDto);
  }
}
