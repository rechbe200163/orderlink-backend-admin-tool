import { Module } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { OrdersController } from './orders.controller';
import { OrdersRepository } from './orders.repository';
import { TypedEventEmitterModule } from 'src/event-emitter/event-emitter.module';
import { PrismaService } from 'src/prisma.service';

@Module({
  imports: [TypedEventEmitterModule],
  controllers: [OrdersController],
  providers: [OrdersService, OrdersRepository, PrismaService],
})
export class OrdersModule {}
