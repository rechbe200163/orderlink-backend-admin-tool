import { ClientsModule, Transport } from '@nestjs/microservices';
import { Module } from '@nestjs/common';
import { TenantsService } from './tenants.service';
import { TenantsController } from './tenants.controller';

@Module({
  controllers: [TenantsController],
  providers: [TenantsService],
  imports: [
    ClientsModule.register([
      {
        name: 'TENANTS_SERVICE',
        transport: Transport.RMQ,
        options: {
          urls: ['amqp://guest:guest@localhost:5672'],
          queue: 'tenant_queue',
        },
      },
      // {
      //   name: 'TENANTS_SERVICE',
      //   transport: Transport.TCP,
      //   options: {
      //     host: 'localhost',
      //     port: 3005,
      //   },
      // },
    ]),
  ],
  exports: [TenantsService],
})
export class TenantsModule {}
