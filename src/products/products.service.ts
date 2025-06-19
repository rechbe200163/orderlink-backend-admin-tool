import { Injectable } from '@nestjs/common';
import { FileRepositoryService } from 'src/file-repository/file-repository.service';
import { CreateProductDto } from 'src/products/dto/create-product.dto';
import { UpdateProductDto } from 'src/products/dto/update-product.dto';
import { ProductsRepository } from './products.repository';

@Injectable()
export class ProductsService {
  constructor(
    private readonly fileService: FileRepositoryService,
    private readonly productRepository: ProductsRepository,
  ) {}
  create(createProductDto: CreateProductDto, file: Express.Multer.File) {
    return this.fileService.uploadFile(file);
  }

  findAll() {
    return `This action returns all products`;
  }

  findOne(id: string) {
    return `This action returns a #${id} product`;
  }

  update(id: string, updateProductDto: UpdateProductDto) {
    return `This action updates a #${id} product`;
  }

  remove(id: string) {
    return `This action removes a #${id} product`;
  }
}
