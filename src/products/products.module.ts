import { Module } from '@nestjs/common';
import { ProductsService } from './products.service';
import { ProductsController } from './products.controller';
import { ProductsRepository } from './products.repository';
import { FileRepositoryModule } from 'src/file-repository/file-repository.module';
import { TypedEventEmitterModule } from 'src/event-emitter/event-emitter.module';

@Module({
  imports: [FileRepositoryModule, TypedEventEmitterModule],
  controllers: [ProductsController],
  providers: [ProductsService, ProductsRepository],
  exports: [ProductsService, ProductsRepository],
})
export class ProductsModule {}
