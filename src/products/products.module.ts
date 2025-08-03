import { Module } from '@nestjs/common';
import { ProductsService } from './products.service';
import { ProductsController } from './products.controller';
import { ProductsRepository } from './products.repository';
import { FileRepositoryModule } from 'src/file-repository/file-repository.module';
import { TypedEventEmitterModule } from 'src/event-emitter/event-emitter.module';
import { FastifyMulterModule } from '@nest-lab/fastify-multer';

@Module({
  imports: [FileRepositoryModule, TypedEventEmitterModule, FastifyMulterModule],
  controllers: [ProductsController],
  providers: [ProductsService, ProductsRepository],
  exports: [ProductsService, ProductsRepository],
})
export class ProductsModule {}
