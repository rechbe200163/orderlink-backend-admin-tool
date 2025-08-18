import { Module } from '@nestjs/common';
import { SiteConfigService } from './site-config.service';
import { SiteConfigController } from './site-config.controller';
import { SiteConfigRepository } from './site-config.repository';
import { FileRepositoryModule } from 'src/file-repository/file-repository.module';
import { Tenant } from 'src/tenants/entities/tenant.entity';
import { TenantsModule } from 'src/tenants/tenants.module';

@Module({
  imports: [FileRepositoryModule, TenantsModule],
  controllers: [SiteConfigController],
  providers: [SiteConfigService, SiteConfigRepository],
})
export class SiteConfigModule {}
