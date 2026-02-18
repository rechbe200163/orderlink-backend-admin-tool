import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
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
import { FileRepositoryModule } from './file-repository/file-repository.module';
import { ConfigModule } from '@nestjs/config';
import { AddressesModule } from './addresses/addresses.module';
import { InvoicesModule } from './invoices/invoices.module';
import { RoutesModule } from './routes/routes.module';
import { StatisticsModule } from './statistics/statistics.module';
import { SiteConfigModule } from './site-config/site-config.module';
import { OtpModule } from './otp/otp.module';
import { z } from 'zod';
import { ActionsModule } from './actions/actions.module';
import { ResourcesModule } from './resources/resources.module';

const envSchema = z.object({
  DATABASE_URL: z.string().min(1), // url() kann bei prisma strings manchmal nerven
  JWT_SECRET: z.string().min(1),

  REDIS_URL: z.string().optional(),

  RESEND_API_KEY: z.string().min(1),
  RESEND_FROM_EMAIL: z.string().email(),

  SUPABASE_URL: z.string().url(),
  SUPABASE_SERVICE_ROLE: z.string().min(1), // <-- passt zu deiner .env
  SUPABASE_PRODUCTS_BUCKET: z.string().min(1),
  SUPABASE_INVOICES_BUCKET: z.string().min(1),
  SUPABASE_SITE_CONFIG_BUCKET: z.string().min(1),
  SUPABASE_ANON: z.string().min(1).optional(),

  STRIPE_SECRET_KEY: z.string().min(1),
  STRIPE_PUBLIC_KEY: z.string().min(1),
  STRIPE_WEBHOOK_SECRET: z.string().min(1),

  FRONTEND_URL: z.string().url().optional(),
});

@Module({
  imports: [
    CacheModule.registerAsync({
      isGlobal: true,
      useFactory: async () => {
        return {
          ttl: 60000, // 1-minute
          stores: [
            createKeyv(process.env.REDIS_URL),
            new Keyv({
              store: new CacheableMemory({ ttl: 60000, lruSize: 5000 }),
            }),
          ],
        };
      },
    }),
    EventEmitterModule.forRoot(),
    ThrottlerModule.forRoot({
      throttlers: [
        {
          ttl: 60000, // milliseconds
          limit: 10, // requests per ttl
        },
      ],
    }),
    ConfigModule.forRoot({
      isGlobal: true, // Makes ConfigService globally available
      envFilePath: '.env', // Default
      validate: (env) => envSchema.parse(env),
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
    FileRepositoryModule,
    AddressesModule,
    InvoicesModule,
    RoutesModule,
    SiteConfigModule,
    StatisticsModule,
    // ProductHistoryModule,
    OtpModule,
    ActionsModule,
    ResourcesModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
