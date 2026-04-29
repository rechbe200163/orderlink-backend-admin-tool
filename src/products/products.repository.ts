import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PagingResultDto } from 'lib/dto/genericPagingResultDto';

import { CreateProductDto } from 'src/products/dto/create-product.dto';
import { ProductDto } from './dto/product.dto';
import { transformResponse } from 'lib/utils/transform';
import { UpdateProductDto } from './dto/update-product.dto';
import { PRISMA_CLIENT } from 'lib/providers/prisma-client.provider';
import { SortOrder } from 'src/common/enums/sort-order.enum';
import { TenantDbContext } from 'lib/tenant-db-context';

@Injectable()
export class ProductsRepository {
  constructor(
    // ✅ use `ExtendedPrismaClient` type for correct type-safety of your extended PrismaClient
    private readonly db: TenantDbContext,
  ) {}

  // products.repository.ts
  async create(createProductDto: CreateProductDto, imageName?: string) {
    console.log('Creating product with data:', imageName);
    // Connect category if provided
    if (!createProductDto.categoryId!) {
      throw new BadRequestException('Category ID is required');
    }

    const product = await this.db.prisma.product.create({
      data: {
        name: createProductDto.name,
        price: createProductDto.price,
        description: createProductDto.description,
        stock: createProductDto.stock,
        imagePath: imageName, // in DB speichern
      },
    });

    await this.db.prisma.categoriesOnProducts.create({
      data: {
        productId: product.productId,
        categoryId: createProductDto.categoryId,
      },
    });

    return product;
  }

  // async getHistory(productId: string): Promise<ProductHistoryDto[]> {
  //   const product = await this.db.prisma.productHistory.findMany({
  //     where: { productId },
  //     orderBy: { version: 'desc' },
  //   });
  //   if (!product) {
  //     throw new NotFoundException(`Product with ID ${productId} not found`);
  //   }
  //   return product.map((history) =>
  //     transformResponse(ProductHistoryDto, history),
  //   );
  // }

  async findAll(
    page: number = 1,
    limit: number = 10,
    sort?: string,
    order?: SortOrder,
    search?: string,
    categoryId?: string,
  ): Promise<PagingResultDto<ProductDto>> {
    const [products, meta] = await this.db.prisma.product
      .paginate({
        where: {
          ...(search && {
            name: {
              contains: search,
              mode: 'insensitive',
            },
          }),
          categories: {
            every: categoryId
              ? {
                  categoryId,
                }
              : undefined,
          },
        },
        orderBy: sort ? { [sort]: order ? order : 'asc' } : undefined,
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
    const product = await this.db.prisma.product.findUnique({
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
    const product = await this.db.prisma.product.update({
      where: { productId },
      data: {
        name: updateProductDto.name,
        price: updateProductDto.price,
        description: updateProductDto.description,
        stock: updateProductDto.stock,
        ...(updateProductDto.categoryId && {
          categories: {
            connect: {
              productId_categoryId: {
                productId,
                categoryId: updateProductDto.categoryId,
              },
            },
          },
        }),
        imagePath: imageName,
      },
    });
    if (!product) {
      throw new NotFoundException(`Product with ID ${productId} not found`);
    }
    return transformResponse(ProductDto, product);
  }

  async findOriginalProductById(productId: string) {
    const product = await this.db.prisma.product.findUnique({
      where: { productId },
    });
    if (!product) {
      throw new NotFoundException(`Product with ID ${productId} not found`);
    }
    return product;
  }

  async findProductByIds(productIds: string[]): Promise<ProductDto[]> {
    const products = await this.db.prisma.product.findMany({
      where: {
        productId: { in: productIds },
      },
    });
    return products.map((product) => transformResponse(ProductDto, product));
  }
}
