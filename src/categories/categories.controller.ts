import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseUUIDPipe,
  UseInterceptors,
  UseGuards,
  Query,
  ParseIntPipe,
  BadRequestException,
} from '@nestjs/common';
import { CategoriesService } from './categories.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConflictResponse,
  ApiForbiddenResponse,
  ApiInternalServerErrorResponse,
  ApiOkResponse,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { Resources } from '../rbac/resources.enum';
import { Resource } from 'lib/decorators/resource.decorator';
import { JwtAuthGuard } from 'src/auth/guards/jwt.guard';
import { PermissionsGuard } from 'src/auth/guards/RBACGuard';
import { HttpCacheInterceptor } from 'lib/interceptors/custom.cache-intercaptor';
import { PagingResultDto } from 'lib/dto/genericPagingResultDto';
import { CategoryDto } from './dto/category.dto';
import { MAX_PAGE_SIZE } from 'lib/constants';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { PaginationQueryDto } from 'src/common/dto/pagination-query.dto';

@Controller('categories')
@UseInterceptors(HttpCacheInterceptor)
@Resource(Resources.CATEGORY)
@ApiInternalServerErrorResponse({
  description: 'Internal server error',
})
@ApiBearerAuth()
@ApiForbiddenResponse({
  description:
    'Role does not have the permissions to perform this action on the requeseted resource',
})
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Post()
  @ApiOkResponse({
    description: 'Category created successfully',
    type: CreateCategoryDto,
  })
  @ApiBody({
    type: CreateCategoryDto,
    description: 'The category to create',
  })
  @ApiConflictResponse({
    description: 'Category with this name already exists',
  })
  create(@Body() createCategoryDto: CreateCategoryDto) {
    return this.categoriesService.create(createCategoryDto);
  }

  @Get()
  @ApiOkResponse({
    description: 'List of categories',
    type: PagingResultDto<CategoryDto>,
  })
  @ApiQuery({
    name: 'search',
    description: 'Search term to filter categories by name',
    type: String,
    required: false,
    example: 'electronics',
  })
  findAll(
    @Query() query: PaginationQueryDto,

    @Query('search') search?: string,
  ) {
    const { limit, page, sort, order } = query;
    return this.categoriesService.findAll(limit, page, sort, order, search);
  }

  @Get(':categoryId')
  @ApiOkResponse({
    description: 'Category found successfully',
    type: CategoryDto,
  })
  @ApiParam({
    name: 'categoryId',
    description: 'The UUID of the category to find',
    type: String,
    required: true,
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  findOne(@Param('categoryId', ParseUUIDPipe) categoryId: string) {
    return this.categoriesService.findById(categoryId);
  }

  @Get('name/:name')
  @ApiOkResponse({
    description: 'Category found successfully by name',
    type: CategoryDto,
  })
  @ApiParam({
    name: 'name',
    description: 'The name of the category to find',
    type: String,
    required: true,
    example: 'Electronics',
  })
  findByName(@Param('name') name: string) {
    return this.categoriesService.findByName(name);
  }

  @Patch(':categoryId')
  @ApiBody({
    type: UpdateCategoryDto,
    description: 'Update an existing category',
  })
  @ApiOkResponse({
    description: 'Category updated successfully',
    type: UpdateCategoryDto,
  })
  @ApiConflictResponse({
    description: 'Category with this name already exists',
  })
  @ApiParam({
    name: 'categoryId',
    description: 'The UUID of the category to update',
    type: String,
    required: true,
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  update(
    @Param('categoryId', ParseUUIDPipe) categoryId: string,
    @Body() updateCategoryDto: UpdateCategoryDto,
  ) {
    return this.categoriesService.update(categoryId, updateCategoryDto);
  }
}
