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
import { ProductHistoryDto } from './dto/product-history';
import { Prisma } from '@prisma/client';

@Injectable()
export class ProductsRepository {
  constructor(
    // ✅ use `ExtendedPrismaClient` type for correct type-safety of your extended PrismaClient
    @Inject('PrismaService')
    private prismaService: CustomPrismaService<ExtendedPrismaClient>,
  ) {}

  // products.repository.ts
  async create(
    tenantId: string,
    createProductDto: CreateProductDto,
    imageName?: string,
  ) {
    console.log('Creating product with data:', imageName);
    return this.prismaService.client.product.create({
      data: {
        tenantId,
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

  async getHistory(
    tenantId: string,
    productId: string,
  ): Promise<ProductHistoryDto[]> {
    const product = await this.prismaService.client.productHistory.findMany({
      where: { tenantId, productId },
      orderBy: { version: 'desc' },
    });
    if (!product) {
      throw new NotFoundException(`Product with ID ${productId} not found`);
    }
    return product.map((history) =>
      transformResponse(ProductHistoryDto, history),
    );
  }

  async findAll(
    tenantId: string,
    limit: number = 10,
    page: number = 1,
    search?: string,
    categoryId?: string,
    includeStock?: boolean,
  ): Promise<PagingResultDto<ProductDto>> {
    const [products, meta] = await this.prismaService.client.product
      .paginate({
        where: {
          tenantId: { equals: tenantId },
          ...(search && {
            name: {
              contains: search,
              mode: 'insensitive',
            },
          }),
          categoryId: categoryId ? { equals: categoryId } : undefined,
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

  async findById(tenantId: string, productId: string): Promise<ProductDto> {
    const product = await this.prismaService.client.product.findUnique({
      where: {
        tenantId_productId: {
          productId,
          tenantId,
        },
      },
    });
    if (!product) {
      throw new NotFoundException(`Product with ID ${productId} not found`);
    }
    return transformResponse(ProductDto, product);
  }

  async update(
    tenantId: string,
    productId: string,
    updateProductDto: UpdateProductDto,
    imageName?: string,
  ): Promise<ProductDto> {
    const product = await this.prismaService.client.product.update({
      where: {
        tenantId_productId: {
          productId,
          tenantId,
        },
      },
      data: {
        name: updateProductDto.name,
        price: updateProductDto.price,
        description: updateProductDto.description,
        stock: updateProductDto.stock,
        categoryId: updateProductDto.categoryId,
        imagePath: imageName,
      },
    });
    if (!product) {
      throw new NotFoundException(`Product with ID ${productId} not found`);
    }
    return transformResponse(ProductDto, product);
  }

  async findOriginalProductById(tenantId: string, productId: string) {
    const product = await this.prismaService.client.product.findUnique({
      where: {
        tenantId_productId: {
          productId,
          tenantId,
        },
      },
    });
    if (!product) {
      throw new NotFoundException(`Product with ID ${productId} not found`);
    }
    return product;
  }

  async findProductByIds(
    tenantId: string,
    productIds: string[],
  ): Promise<ProductDto[]> {
    const products = await this.prismaService.client.product.findMany({
      where: {
        productId: { in: productIds },
        tenantId: { equals: tenantId },
      },
    });
    return products.map((product) => transformResponse(ProductDto, product));
  }
}
