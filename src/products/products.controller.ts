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
  Query,
  UseGuards,
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
import { FileInterceptor } from '@nestjs/platform-express';
import { FileSizeValidationPipe } from 'lib/pipes/file-size-validation-pipe';
import { FileTypeValidationPipe } from 'lib/pipes/file-name-validation-pipe.ts';
import { PaginationQueryDto } from 'src/common/dto/pagination-query.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt.guard';
import { PermissionsGuard } from 'src/auth/guards/RBACGuard';

@Controller('products')
@UseInterceptors(CacheInterceptor)
@Resource(Resources.PRODUCT)
@ApiInternalServerErrorResponse({
  description: 'Internal server error',
})
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PermissionsGuard)
@ApiForbiddenResponse({
  description:
    'Role does not have the permissions to perform this action on the requeseted resource',
})
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @ApiConsumes('multipart/form-data')
  @Post()
  async create(
    productImage: Express.Multer.File,
    @Body() createProductDto: CreateProductDto,
  ) {
    console.log(
      'Received request to create product with data:',
      createProductDto,
    );
    return this.productsService.create(createProductDto, productImage);
  }

  @Get()
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
    @Query() query: PaginationQueryDto,
    @Query('search') search?: string,
    @Query('categoryId') categoryId?: string,
  ) {
    const { page, limit, sort, order } = query;
    console.log(query);
    return this.productsService.findAll(
      page,
      limit,
      sort,
      order,
      search,
      categoryId,
    );
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

  // @Get('history/:productId')
  // @ApiOkResponse({
  //   description: 'Product history retrieved successfully',
  //   type: [ProductDto],
  // })
  // @ApiBadRequestResponse({
  //   description: 'Invalid product ID format',
  // })
  // getHistory(@Param('productId', ParseUUIDPipe) productId: string) {
  //   return this.productsService.getHistory(productId);
  // }

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
    @UploadedFile(new FileSizeValidationPipe(), new FileTypeValidationPipe())
    productImage: Express.Multer.File,
  ) {
    return console.log(productImage);
  }
}
