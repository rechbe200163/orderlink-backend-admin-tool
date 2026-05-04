import { Test, TestingModule } from '@nestjs/testing';
import { RouteOrdersService } from './route-orders.service';

describe('RouteOrdersService', () => {
  let service: RouteOrdersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [RouteOrdersService],
    }).compile();

    service = module.get<RouteOrdersService>(RouteOrdersService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
