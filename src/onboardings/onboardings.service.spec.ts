import { Test, TestingModule } from '@nestjs/testing';
import { OnboardingsService } from './onboardings.service';

describe('OnboardingsService', () => {
  let service: OnboardingsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [OnboardingsService],
    }).compile();

    service = module.get<OnboardingsService>(OnboardingsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
