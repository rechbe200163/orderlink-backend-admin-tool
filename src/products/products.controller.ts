import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  UseInterceptors,
  UploadedFile,
  ParseUUIDPipe,
  ParseIntPipe,
  Query,
} from '@nestjs/common';
import { ProductsService } from './products.service';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiForbiddenResponse,
  ApiInternalServerErrorResponse,
  ApiOkResponse,
  ApiQuery,
} from '@nestjs/swagger';
import { CacheInterceptor } from '@nestjs/cache-manager';
import { Resources } from '../rbac/resources.enum';
import { Resource } from 'lib/decorators/resource.decorator';
import { CreateProductDto } from 'src/products/dto/create-product.dto';
import { UpdateProductDto } from 'src/products/dto/update-product.dto';
import { PagingResultDto } from 'lib/dto/genericPagingResultDto';
import { ProductDto } from './dto/product.dto';
import { MAX_PAGE_SIZE } from 'lib/constants';
import { File, FileInterceptor } from '@nest-lab/fastify-multer';

@Controller('products')
@UseInterceptors(CacheInterceptor)
@Resource(Resources.PRODUCT)
@ApiInternalServerErrorResponse({
  description: 'Internal server error',
})
@ApiBearerAuth()
@ApiForbiddenResponse({
  description:
    'Role does not have the permissions to perform this action on the requeseted resource',
})
// @UseGuards(JwtAuthGuard, PermissionsGuard)
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Post()
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'Create product',
    type: CreateProductDto,
  })
  @ApiOkResponse({
    description: 'Product created successfully',
    type: CreateProductDto,
  })
  @UseInterceptors(FileInterceptor('productImage'))
  async create(
    @Body() createProductDto: CreateProductDto,
    @UploadedFile() productImage: File,
  ) {
    console.log(createProductDto);
    return console.log(productImage);
    // return this.productsService.create(createProductDto, productImage);
  }

  @Get()
  @ApiQuery({
    name: 'page',
    description: 'Page number to return',
    type: Number,
    default: 1,
    required: true,
    example: 1,
  })
  @ApiQuery({
    name: 'limit',
    description: 'Number of products to return per page',
    type: Number,
    default: 10,
    required: true,
    maximum: MAX_PAGE_SIZE,
    example: 10,
  })
  @ApiQuery({
    name: 'search',
    description: 'Search term to filter products by name or description',
    required: false,
    example: 'example search term',
    type: String,
    default: undefined,
  })
  @ApiQuery({
    name: 'categoryId',
    description: 'Category to filter products',
    required: false,
    example: 'electronics',
    type: String,
    default: undefined,
  })
  @ApiOkResponse({
    description: 'List of all products',
    type: PagingResultDto<ProductDto>,
  })
  findAll(
    @Query('search') search?: string,
    @Query('categoryId') categoryId?: string,
    @Query('page', ParseIntPipe) page: number = 1,
    @Query('limit', ParseIntPipe) limit: number = 10,
  ) {
    return this.productsService.findAll(limit, page, search, categoryId);
  }

  @Get(':productId')
  @ApiOkResponse({
    description: 'List of all products',
    type: ProductDto,
  })
  @ApiBadRequestResponse({
    description: 'Invalid product ID format',
  })
  findOne(@Param('productId', ParseUUIDPipe) productId: string) {
    return this.productsService.findOne(productId);
  }

  @Get('history/:productId')
  @ApiOkResponse({
    description: 'Product history retrieved successfully',
    type: [ProductDto],
  })
  @ApiBadRequestResponse({
    description: 'Invalid product ID format',
  })
  getHistory(@Param('productId', ParseUUIDPipe) productId: string) {
    return this.productsService.getHistory(productId);
  }

  @Patch(':productId')
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'Update product',
    type: UpdateProductDto,
  })
  @ApiOkResponse({
    description: 'Product updated successfully',
    type: UpdateProductDto,
  })
  @UseInterceptors(FileInterceptor('productImage'))
  async update(
    @Param('productId', ParseUUIDPipe) productId: string,
    @Body() updateProductDto: UpdateProductDto,
    @UploadedFile() productImage: File,
  ) {
    return console.log(productImage);
  }
}
