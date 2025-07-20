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
  async create(createProductDto: CreateProductDto, file: Express.Multer.File) {
    let imageFilename: string | undefined;

    if (file) {
      const uploadResult = await this.fileService.uploadFile(file);
      console.log('File uploaded successfully:', uploadResult);
      imageFilename = uploadResult;
      console.log('Image filename:', imageFilename);
    }

    const product = await this.productRepository.create(
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

  async getHistory(productId: string): Promise<ProductHistoryDto[]> {
    const productHistory = await this.productRepository.getHistory(productId);
    if (!productHistory) {
      throw new NotFoundException(
        `Product history for ID ${productId} not found`,
      );
    }
    return productHistory;
  }

  async findAll(
    limit = 10,
    page = 1,
    search?: string,
    categoryId?: string,
  ): Promise<PagingResultDto<ProductDto>> {
    const { data: products, meta } = await this.productRepository.findAll(
      limit,
      page,
      search,
      categoryId,
    );

    // Falls paginate ein { data, meta }-Objekt zurückgibt:
    const productsWithUrls = await Promise.all(
      products.map(async (product) => {
        const imageUrl = product.imagePath
          ? await this.fileService.getFile(product.imagePath)
          : null;

        return {
          ...product,
          imageUrl,
        };
      }),
    );

    return {
      data: productsWithUrls,
      meta,
    };
  }

  async findOne(id: string): Promise<ProductDto> {
    const product = await this.productRepository.findById(id);

    const imagePath = product.imagePath
      ? await this.fileService.getFile(product.imagePath)
      : null;

    return {
      ...product,
      imagePath,
    };
  }

  async update(
    id: string,
    updateProductDto: UpdateProductDto,
    file: Express.Multer.File,
  ) {
    let imageFilename: string | undefined;

    const originalProduct = await this.productRepository.findById(id);

    if (file) {
      const uploadResult = await this.fileService.uploadFile(file);
      console.log('File uploaded successfully:', uploadResult);
      imageFilename = uploadResult;
    }

    const product = await this.productRepository.update(
      id,
      updateProductDto,
      imageFilename,
    );

    this.eventEmitter.emit('product.updated', {
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
}
