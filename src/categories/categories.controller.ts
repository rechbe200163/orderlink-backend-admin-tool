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
import { CacheInterceptor } from '@nestjs/cache-manager';
import { PagingResultDto } from 'lib/dto/genericPagingResultDto';
import { CategoryDto } from './dto/category.dto';
import { MAX_PAGE_SIZE } from 'lib/constants';
import { UpdateCategoryDto } from './dto/update-category.dto';

@Controller('categories')
@UseInterceptors(CacheInterceptor)
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
    name: 'limit',
    description: 'Number of customers to return per page',
    type: Number,
    default: 10,
    required: true,
    maximum: MAX_PAGE_SIZE,
    example: 10,
  })
  @ApiQuery({
    name: 'page',
    description: 'Page number to return',
    type: Number,
    default: 1,
    required: true,
    example: 1,
  })
  @ApiQuery({
    name: 'search',
    description: 'Search term to filter categories by name',
    type: String,
    required: false,
    example: 'electronics',
  })
  findAll(
    @Query('limit', ParseIntPipe) limit: number = 10,
    @Query('page', ParseIntPipe) page: number = 1,
    @Query('search') search?: string,
  ) {
    const maxLimit = MAX_PAGE_SIZE; // Define a maximum limit for pagination
    if (limit > maxLimit) {
      throw new BadRequestException(`Limit cannot exceed ${maxLimit}`);
    }
    return this.categoriesService.findAll(limit, page, search);
  }

  @Get(':id')
  @ApiOkResponse({
    description: 'Category found successfully',
    type: CategoryDto,
  })
  @ApiParam({
    name: 'id',
    description: 'The UUID of the category to find',
    type: String,
    required: true,
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.categoriesService.findById(id);
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

  @Patch(':id')
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
    name: 'id',
    description: 'The UUID of the category to update',
    type: String,
    required: true,
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateCategoryDto: UpdateCategoryDto,
  ) {
    return this.categoriesService.update(id, updateCategoryDto);
  }
}
