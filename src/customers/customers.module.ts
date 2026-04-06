import { Module } from '@nestjs/common';
import { CustomersService } from './customers.service';
import { CustomersController } from './customers.controller';
import { CustomersRepository } from './customer.repository';
import { TypedEventEmitterModule } from 'src/event-emitter/event-emitter.module';
import { PRISMA_CLIENT } from 'lib/providers/prisma-client.provider';
import { DatabaseModule } from 'src/database/database.module';

@Module({
  imports: [TypedEventEmitterModule, DatabaseModule],
  controllers: [CustomersController],
  providers: [CustomersService, CustomersRepository],
  exports: [CustomersService],
})
export class CustomersModule {}
