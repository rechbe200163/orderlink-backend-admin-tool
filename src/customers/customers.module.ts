import { Module } from '@nestjs/common';
import { CustomersService } from './customers.service';
import { CustomersController } from './customers.controller';
import { CustomersRepository } from './customer.repository';
import { TypedEventEmitterModule } from 'src/event-emitter/event-emitter.module';
import { PrismaService } from 'src/prisma.service';

@Module({
  imports: [TypedEventEmitterModule],
  controllers: [CustomersController],
  providers: [CustomersService, CustomersRepository, PrismaService],
  exports: [CustomersService],
})
export class CustomersModule {}
