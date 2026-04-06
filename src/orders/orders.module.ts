import { Module } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { OrdersController } from './orders.controller';
import { OrdersRepository } from './orders.repository';
import { TypedEventEmitterModule } from 'src/event-emitter/event-emitter.module';
import { DatabaseModule } from 'src/database/database.module';

@Module({
  imports: [TypedEventEmitterModule, DatabaseModule],
  controllers: [OrdersController],
  providers: [OrdersService, OrdersRepository],
})
export class OrdersModule {}
