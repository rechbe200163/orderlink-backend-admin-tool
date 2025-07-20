import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { ProductHistoryRepository } from './product-history.repository';
import { EventPayloads } from 'src/event-emitter/interface/event-types.interface';

@Injectable()
export class ProductHistoryService {
  constructor(private readonly historyRepository: ProductHistoryRepository) {}

  @OnEvent('product.updated')
  async handleProductUpdated(event: EventPayloads['product.updated']) {
    await this.historyRepository.create(event);
  }
}
