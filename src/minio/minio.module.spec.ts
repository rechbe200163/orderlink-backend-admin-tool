import { Test, TestingModule } from '@nestjs/testing';
import { MinioModule } from './minio.module';

describe('MinioModule', () => {
  let module: TestingModule;

  beforeEach(async () => {
    module = await Test.createTestingModule({
      imports: [MinioModule],
    }).compile();
  });

  it('should be defined', () => {
    expect(module).toBeDefined();
  });
});
