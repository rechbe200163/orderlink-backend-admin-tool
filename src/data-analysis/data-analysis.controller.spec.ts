import { Test, TestingModule } from '@nestjs/testing';
import { DataAnalysisController } from './data-analysis.controller';
import { DataAnalysisService } from './data-analysis.service';

describe('DataAnalysisController', () => {
  let controller: DataAnalysisController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DataAnalysisController],
      providers: [DataAnalysisService],
    }).compile();

    controller = module.get<DataAnalysisController>(DataAnalysisController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
