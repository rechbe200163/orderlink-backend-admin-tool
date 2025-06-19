import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CustomPrismaModule } from 'nestjs-prisma';
import { extendedPrismaClient } from 'prisma/prisma.extension';
import { ThrottlerModule } from '@nestjs/throttler';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { CustomersModule } from './customers/customers.module';
import { AuthModule } from './auth/auth.module';
import { CacheModule } from '@nestjs/cache-manager';
import { CacheableMemory } from 'cacheable';
import { createKeyv } from '@keyv/redis';
import { Keyv } from 'keyv';
import { RolesModule } from './roles/roles.module';
import { PermissionsModule } from './permissions/permissions.module';
import { EmployeesModule } from './employees/employees.module';
import { CategoriesModule } from './categories/categories.module';
import { EmailModule } from './email/email.module';
import { OrdersModule } from './orders/orders.module';
import { ProductsModule } from './products/products.module';

@Module({
  imports: [
    CacheModule.registerAsync({
      isGlobal: true,
      useFactory: async () => {
        return {
          ttl: 60000,
          stores: [
            createKeyv('redis://localhost:6379'),
            new Keyv({
              store: new CacheableMemory({ ttl: 60000, lruSize: 5000 }),
            }),
          ],
        };
      },
    }),
    EventEmitterModule.forRoot(),
    CustomPrismaModule.forRootAsync({
      name: 'PrismaService',
      useFactory: () => {
        return extendedPrismaClient;
      },
      isGlobal: true,
    }),
    ThrottlerModule.forRoot({
      throttlers: [
        {
          ttl: 60000, // milliseconds
          limit: 10, // requests per ttl
        },
      ],
    }),
    EmailModule,
    CustomersModule,
    AuthModule,
    EmployeesModule,
    RolesModule,
    PermissionsModule,
    CategoriesModule,
    OrdersModule,
    ProductsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
