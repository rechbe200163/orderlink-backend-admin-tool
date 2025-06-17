import { Injectable } from '@nestjs/common';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { CategoriesRepository } from './categories.repository';
import { CategoryDto } from './dto/category.dto';
import { PagingResultDto } from 'lib/dto/generictPagingReslutDto';

@Injectable()
export class CategoriesService {
  constructor(
    private readonly categoriesRepository: CategoriesRepository, // Assuming you have a repository to handle DB operations
  ) {}

  create(createCategoryDto: CreateCategoryDto): Promise<CreateCategoryDto> {
    return this.categoriesRepository.create(createCategoryDto);
  }

  findAll(
    limit: number = 10,
    page: number = 1,
    search?: string,
  ): Promise<PagingResultDto<CategoryDto>> {
    return this.categoriesRepository.findAll(limit, page, search);
  }

  findById(id: string): Promise<CategoryDto> {
    return this.categoriesRepository.findById(id);
  }

  findByName(name: string): Promise<CategoryDto> {
    return this.categoriesRepository.findByName(name);
  }

  update(
    id: string,
    updateCategoryDto: UpdateCategoryDto,
  ): Promise<UpdateCategoryDto> {
    return this.categoriesRepository.update(id, updateCategoryDto);
  }
}
