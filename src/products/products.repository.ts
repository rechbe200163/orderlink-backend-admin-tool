import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { PagingResultDto } from 'lib/dto/genericPagingResultDto';
import { CustomPrismaService } from 'nestjs-prisma';
import { ExtendedPrismaClient } from 'prisma/prisma.extension';
import { FileRepositoryService } from 'src/file-repository/file-repository.service';
import { CreateProductDto } from 'src/products/dto/create-product.dto';
import { ProductDto } from './dto/product.dto';
import { transformResponse } from 'lib/utils/transform';
import { NotFoundError } from 'rxjs';
import { UpdateProductDto } from './dto/update-product.dto';

@Injectable()
export class ProductsRepository {
  constructor(
    // ✅ use `ExtendedPrismaClient` type for correct type-safety of your extended PrismaClient
    @Inject('PrismaService')
    private prismaService: CustomPrismaService<ExtendedPrismaClient>,
  ) {}

  // products.repository.ts
  async create(createProductDto: CreateProductDto, imageName?: string) {
    console.log('Creating product with data:', imageName);
    return this.prismaService.client.product.create({
      data: {
        name: createProductDto.name,
        price: createProductDto.price,
        description: createProductDto.description,
        stock: createProductDto.stock,
        imagePath: imageName, // in DB speichern
        categoryId: createProductDto.categoryId, // Kategorie zuordnen
      },
    });
    // Kategorien zuordnen
  }

  async findAll(
    limit: number = 10,
    page: number = 1,
    search?: string,
    categoryId?: string,
  ): Promise<PagingResultDto<ProductDto>> {
    const [products, meta] = await this.prismaService.client.product
      .paginate({
        where: {
          ...(search && {
            name: {
              contains: search,
              mode: 'insensitive',
            },
          }),
          ...(categoryId && { categoryId }),
        },
        orderBy: {
          createdAt: 'desc',
        },
      })
      .withPages({
        limit,
        page,
        includePageCount: true,
      });

    return {
      data: products.map((product) => transformResponse(ProductDto, product)),
      meta,
    };
  }

  async findById(productId: string): Promise<ProductDto> {
    const product = await this.prismaService.client.product.findUnique({
      where: { productId },
    });
    if (!product) {
      throw new NotFoundException(`Product with ID ${productId} not found`);
    }
    return transformResponse(ProductDto, product);
  }

  async update(
    productId: string,
    updateProductDto: UpdateProductDto,
    imageName?: string,
  ): Promise<ProductDto> {
    const product = await this.prismaService.client.product.update({
      where: { productId },
      data: {
        name: updateProductDto.name,
        price: updateProductDto.price,
        description: updateProductDto.description,
        stock: updateProductDto.stock,
        imagePath: imageName, // in DB speichern
        categoryId: updateProductDto.categoryId, // Kategorie zuordnen
      },
    });
    if (!product) {
      throw new NotFoundException(`Product with ID ${productId} not found`);
    }
    return transformResponse(ProductDto, product);
  }
}
