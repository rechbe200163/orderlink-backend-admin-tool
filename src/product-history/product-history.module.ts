import { Module } from '@nestjs/common';
import { ProductHistoryService } from './product-history.service';
import { ProductHistoryRepository } from './product-history.repository';
import { TypedEventEmitterModule } from 'src/event-emitter/event-emitter.module';

@Module({
  imports: [TypedEventEmitterModule],
  providers: [ProductHistoryService, ProductHistoryRepository],
})
export class ProductHistoryModule {}
