import { Module } from '@nestjs/common';
import { InvoicesService } from './invoices.service';
import { InvoicesController } from './invoices.controller';
import { InvoicesRepository } from './invoices.repository';
import { TypedEventEmitterModule } from 'src/event-emitter/event-emitter.module';
import { OrdersRepository } from 'src/orders/orders.repository';
import { MinioModule } from 'src/minio/minio.module';

@Module({
  imports: [TypedEventEmitterModule, MinioModule],
  controllers: [InvoicesController],
  providers: [InvoicesService, InvoicesRepository, OrdersRepository],
})
export class InvoicesModule {}
