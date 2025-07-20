import { Product } from './../../prisma/src/generated/dto/product.entity';
import { Injectable, NotFoundException } from '@nestjs/common';
import { FileRepositoryService } from 'src/file-repository/file-repository.service';
import { CreateProductDto } from 'src/products/dto/create-product.dto';
import { UpdateProductDto } from 'src/products/dto/update-product.dto';
import { ProductsRepository } from './products.repository';
import { PagingResultDto } from 'lib/dto/genericPagingResultDto';
import { ProductDto } from './dto/product.dto';
import { ProductHistoryDto } from './dto/product-history';

@Injectable()
export class ProductsService {
  constructor(
    private readonly fileService: FileRepositoryService,
    private readonly productRepository: ProductsRepository,
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

    return this.productRepository.create(createProductDto, imageFilename);
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

    if (file) {
      const uploadResult = await this.fileService.uploadFile(file);
      console.log('File uploaded successfully:', uploadResult);
      imageFilename = uploadResult;
    }

    return this.productRepository.update(id, updateProductDto, imageFilename);
  }

  remove(id: string) {
    return `This action removes a #${id} product`;
  }
}
