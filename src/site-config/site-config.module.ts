import { Module } from '@nestjs/common';
import { SiteConfigService } from './site-config.service';
import { SiteConfigController } from './site-config.controller';
import { SiteConfigRepository } from './site-config.repository';
import { FileRepositoryModule } from 'src/file-repository/file-repository.module';
@Module({
  imports: [FileRepositoryModule],
  controllers: [SiteConfigController],
  exports: [SiteConfigService, SiteConfigRepository],
  providers: [SiteConfigService, SiteConfigRepository],
})
export class SiteConfigModule {}
