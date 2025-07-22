import { Test, TestingModule } from '@nestjs/testing';
import { SiteConfigController } from './site-config.controller';
import { SiteConfigService } from './site-config.service';

describe('SiteConfigController', () => {
  let controller: SiteConfigController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SiteConfigController],
      providers: [SiteConfigService],
    }).compile();

    controller = module.get<SiteConfigController>(SiteConfigController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
