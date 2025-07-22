import { Test, TestingModule } from '@nestjs/testing';
import { SiteConfigService } from './site-config.service';

describe('SiteConfigService', () => {
  let service: SiteConfigService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SiteConfigService],
    }).compile();

    service = module.get<SiteConfigService>(SiteConfigService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
