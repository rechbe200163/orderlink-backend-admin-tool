import { Module } from '@nestjs/common';
import { SiteConfigService } from './site-config.service';
import { SiteConfigController } from './site-config.controller';
import { SiteConfigRepository } from './site-config.repository';
import { FileRepositoryModule } from 'src/file-repository/file-repository.module';
import { DatabaseModule } from 'src/database/database.module';
@Module({
  imports: [FileRepositoryModule, DatabaseModule],
  controllers: [SiteConfigController],
  exports: [SiteConfigService, SiteConfigRepository],
  providers: [SiteConfigService, SiteConfigRepository],
})
export class SiteConfigModule {}
