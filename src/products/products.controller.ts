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
  Req,
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
import { MAX_PAGE_SIZE } from 'lib/constants';
import { FileInterceptor } from '@nestjs/platform-express';
import { FileSizeValidationPipe } from 'lib/pipes/file-size-validation-pipe';
import { FileTypeValidationPipe } from 'lib/pipes/file-name-validation-pipe.ts';
import { requireTenantId } from 'lib/common/tenant.util';
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
// @UseGuards(JwtAuthGuard, PermissionsGuard)
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @ApiConsumes('multipart/form-data')
  @Post()
  @UseInterceptors(FileInterceptor('productImage'))
  async create(
    @Req() req,
    @UploadedFile(new FileSizeValidationPipe(), new FileTypeValidationPipe())
    productImage: Express.Multer.File,
    @Body() createProductDto: CreateProductDto,
  ) {
    const { tenantId } = requireTenantId(req);
    return this.productsService.create(
      tenantId,
      createProductDto,
      productImage,
    );
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
    @Req() req: Request,
    @Query('search') search?: string,
    @Query('categoryId') categoryId?: string,
    @Query('page', ParseIntPipe) page: number = 1,
    @Query('limit', ParseIntPipe) limit: number = 10,
  ) {
    const { tenantId } = requireTenantId(req);
    return this.productsService.findAll(
      tenantId,
      limit,
      page,
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
  findOne(@Req() req, @Param('productId', ParseUUIDPipe) productId: string) {
    const { tenantId } = requireTenantId(req);
    return this.productsService.findOne(tenantId, productId);
  }

  @Get('history/:productId')
  @ApiOkResponse({
    description: 'Product history retrieved successfully',
    type: [ProductDto],
  })
  @ApiBadRequestResponse({
    description: 'Invalid product ID format',
  })
  getHistory(@Req() req, @Param('productId', ParseUUIDPipe) productId: string) {
    const { tenantId } = requireTenantId(req);
    return this.productsService.getHistory(tenantId, productId);
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
    @Req() req,
    @Param('productId', ParseUUIDPipe) productId: string,
    @Body() updateProductDto: UpdateProductDto,
    @UploadedFile(new FileSizeValidationPipe(), new FileTypeValidationPipe())
    productImage: Express.Multer.File,
  ) {
    const { tenantId } = requireTenantId(req);
    return this.productsService.update(
      tenantId,
      productId,
      updateProductDto,
      productImage,
    );
  }
}
