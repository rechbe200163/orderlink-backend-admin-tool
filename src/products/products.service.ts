import { Injectable, NotFoundException } from '@nestjs/common';
import {
  FileRepositoryService,
  StorageBucket,
} from 'src/file-repository/file-repository.service';
import { CreateProductDto } from 'src/products/dto/create-product.dto';
import { UpdateProductDto } from 'src/products/dto/update-product.dto';
import { ProductsRepository } from './products.repository';
import { PagingResultDto } from 'lib/dto/genericPagingResultDto';
import { ProductDto } from './dto/product.dto';
import { TypedEventEmitter } from 'src/event-emitter/typed-event-emitter.class';
import { ProductHistoryDto } from './dto/product-history';

const PRODUCT_BUCKET: StorageBucket = 'products';

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
      imageFilename = await this.fileService.uploadFile(
        tenantId,
        productImage,
        PRODUCT_BUCKET,
      );
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

    return this.appendSignedImage(product);
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
    const historyWithSignedImages = await Promise.all(
      productHistory.map((history) => this.appendSignedImage(history)),
    );
    return historyWithSignedImages;
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

    const productsWithSignedUrls = await Promise.all(
      products.map((product) => this.appendSignedImage(product)),
    );

    return {
      data: productsWithSignedUrls,
      meta,
    };
  }

  async findOne(tenantId: string, id: string): Promise<ProductDto> {
    const product = await this.productRepository.findById(tenantId, id);
    return this.appendSignedImage(product);
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
      imageFilename = await this.fileService.uploadFile(
        tenantId,
        file,
        PRODUCT_BUCKET,
      );
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

    return this.appendSignedImage(product);
  }

  remove(id: string) {
    return `This action removes a #${id} product`;
  }

  private async appendSignedImage<T extends { imagePath?: string | null }>(
    product: T,
  ): Promise<T> {
    if (!product?.imagePath) {
      return product;
    }

    const signedUrl = await this.fileService.getSignedUrl(
      PRODUCT_BUCKET,
      product.imagePath,
    );

    return {
      ...product,
      imagePath: signedUrl ?? product.imagePath,
    };
  }
}

