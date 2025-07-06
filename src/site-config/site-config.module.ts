import { Module } from '@nestjs/common';
import { SiteConfigService } from './site-config.service';
import { SiteConfigController } from './site-config.controller';
import { SiteConfigRepository } from './site-config.repository';

@Module({
  controllers: [SiteConfigController],
  providers: [SiteConfigService, SiteConfigRepository],
})
export class SiteConfigModule {}
