import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseInterceptors,
  UploadedFile,
  UseGuards,
  ParseUUIDPipe,
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
} from '@nestjs/swagger';
import { CacheInterceptor } from '@nestjs/cache-manager';
import { Ressources } from '@prisma/client';
import { Resource } from 'lib/decorators/ressource-decorator';
import { CreateProductDto } from 'src/products/dto/create-product.dto';
import { UpdateProductDto } from 'src/products/dto/update-product.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { PagingResultDto } from 'lib/dto/generictPagingReslutDto';
import { ProductDto } from './dto/product.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt.guard';
import { PermissionsGuard } from 'src/auth/guards/RBACGuard';

@Controller('products')
@UseInterceptors(CacheInterceptor)
@Resource(Ressources.PRODUCT)
@ApiInternalServerErrorResponse({
  description: 'Internal server error',
})
@ApiBearerAuth()
@ApiForbiddenResponse({
  description:
    'Role does not have the permissions to perform this action on the requeseted ressource',
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
  create(
    @Body() createProductDto: CreateProductDto,
    @UploadedFile() file: Express.Multer.File,
  ) {
    console.log('Received product data:', createProductDto);
    console.log('Received file:', file);
    return this.productsService.create(createProductDto, file);
  }

  @Get()
  @ApiOkResponse({
    description: 'List of all products',
    type: PagingResultDto<ProductDto>,
  })
  findAll() {
    return this.productsService.findAll();
  }

  @Get(':id')
  @ApiOkResponse({
    description: 'List of all products',
    type: ProductDto,
  })
  @ApiBadRequestResponse({
    description: 'Invalid product ID format',
  })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.productsService.findOne(id);
  }

  @Patch(':id')
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
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateProductDto: UpdateProductDto,
  ) {
    return this.productsService.update(id, updateProductDto);
  }
}
