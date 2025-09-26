import { Test, TestingModule } from '@nestjs/testing';
import { OnboardingsController } from './onboardings.controller';
import { OnboardingsService } from './onboardings.service';

describe('OnboardingsController', () => {
  let controller: OnboardingsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [OnboardingsController],
      providers: [OnboardingsService],
    }).compile();

    controller = module.get<OnboardingsController>(OnboardingsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
