import { Global, Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient } from '@supabase/supabase-js';
import { SUPABASE_CLIENT_TOKEN } from './supabase-storage.decorator';

@Global()
@Module({
  providers: [
    {
      provide: SUPABASE_CLIENT_TOKEN,
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const url = configService.getOrThrow<string>('SUPABASE_URL');
        const serviceRoleKey = configService.getOrThrow<string>(
          'SUPABASE_SERVICE_ROLE',
        );

        return createClient(url, serviceRoleKey, {
          auth: {
            persistSession: false,
            autoRefreshToken: false,
          },
        });
      },
    },
  ],
  exports: [SUPABASE_CLIENT_TOKEN],
})
export class SupabaseStorageModule {}

