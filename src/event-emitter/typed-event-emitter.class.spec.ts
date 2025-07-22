import { Test, TestingModule } from '@nestjs/testing';
import { TypedEventEmitter } from './typed-event-emitter.class';

describe('TypedEventEmitter', () => {
  let service: TypedEventEmitter;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [TypedEventEmitter],
    }).compile();

    service = module.get<TypedEventEmitter>(TypedEventEmitter);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
