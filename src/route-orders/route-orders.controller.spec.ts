import { Test, TestingModule } from '@nestjs/testing';
import { RouteOrdersController } from './route-orders.controller';
import { RouteOrdersService } from './route-orders.service';

describe('RouteOrdersController', () => {
  let controller: RouteOrdersController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [RouteOrdersController],
      providers: [RouteOrdersService],
    }).compile();

    controller = module.get<RouteOrdersController>(RouteOrdersController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
