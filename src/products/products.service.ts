import { Product } from './../../prisma/src/generated/dto/product.entity';
import { Injectable, NotFoundException } from '@nestjs/common';
import { FileRepositoryService } from 'src/file-repository/file-repository.service';
import { CreateProductDto } from 'src/products/dto/create-product.dto';
import { UpdateProductDto } from 'src/products/dto/update-product.dto';
import { ProductsRepository } from './products.repository';
import { PagingResultDto } from 'lib/dto/genericPagingResultDto';
import { ProductDto } from './dto/product.dto';
import { TypedEventEmitter } from 'src/event-emitter/typed-event-emitter.class';
import { ProductHistoryDto } from './dto/product-history';

@Injectable()
export class ProductsService {
  constructor(
    private readonly fileService: FileRepositoryService,
    private readonly productRepository: ProductsRepository,
    private readonly eventEmitter: TypedEventEmitter,
  ) {}
  // products.service.ts
  async create(
    tenantId: string,
    createProductDto: CreateProductDto,
    productImage?: Express.Multer.File,
  ) {
    let imageFilename: string | undefined;

    if (productImage) {
      imageFilename = await this.fileService.uploadFile(tenantId, productImage);
    }

    const product = await this.productRepository.create(
      tenantId,
      createProductDto,
      imageFilename,
    );

    this.eventEmitter.emit('product.created', {
      productId: product.productId,
      name: product.name,
      price: product.price,
      description: product.description,
      stock: product.stock,
      imagePath: product.imagePath ?? null,
      categoryId: product.categoryId,
    });

    return product;
  }

  async getHistory(
    tenantId: string,
    productId: string,
  ): Promise<ProductHistoryDto[]> {
    const productHistory = await this.productRepository.getHistory(
      tenantId,
      productId,
    );
    if (!productHistory) {
      throw new NotFoundException(
        `Product history for ID ${productId} not found`,
      );
    }
    return productHistory;
  }

  async findAll(
    tenantId: string,
    limit = 10,
    page = 1,
    search?: string,
    categoryId?: string,
  ): Promise<PagingResultDto<ProductDto>> {
    const { data: products, meta } = await this.productRepository.findAll(
      tenantId,
      limit,
      page,
      search,
      categoryId,
    );

    const productsWithCdnImageURL = products.map((product) => {
      if (!product.imagePath?.startsWith('https')) {
        return {
          ...product,
          imagePath: this.addCdnImageUrl(product.imagePath)!,
        };
      }
      return {
        ...product,
      };
    });
    return {
      data: productsWithCdnImageURL,
      meta,
    };
  }

  async findOne(tenantId: string, id: string): Promise<ProductDto> {
    const product = await this.productRepository.findById(tenantId, id);
    const imageUrl = this.addCdnImageUrl(product.imagePath);
    return {
      ...product,
      imagePath: imageUrl!,
    };
  }

  async update(
    tenantId: string,
    id: string,
    updateProductDto: UpdateProductDto,
    file?: Express.Multer.File,
  ) {
    let imageFilename: string | undefined;

    const originalProduct =
      await this.productRepository.findOriginalProductById(tenantId, id);

    if (file) {
      imageFilename = await this.fileService.uploadFile(tenantId, file);
    }

    const product = await this.productRepository.update(
      tenantId,
      id,
      updateProductDto,
      imageFilename,
    );

    this.eventEmitter.emit('product.updated', {
      tenantId,
      productId: originalProduct.productId,
      name: originalProduct.name,
      price: originalProduct.price,
      description: originalProduct.description,
      stock: originalProduct.stock,
      imagePath: originalProduct.imagePath ?? null,
      categoryId: originalProduct.categoryId,
    });

    return product;
  }

  remove(id: string) {
    return `This action removes a #${id} product`;
  }

  private addCdnImageUrl(productImage: string | null): string | undefined {
    if (!productImage) return;

    const cdnUrl = `https://localhost/product-images/${productImage}`;
    return cdnUrl;
  }
}
