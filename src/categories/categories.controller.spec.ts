import { Test, TestingModule } from '@nestjs/testing';
import { CategoriesController } from './categories.controller';
import { CategoriesService } from './categories.service';
import { CreateCategoryDto } from './dto/create-category.dto';

describe('CategoriesController', () => {
  let controller: CategoriesController;
  let service: CategoriesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CategoriesController],
      providers: [
        {
          provide: CategoriesService,
          useValue: {
            create: jest.fn().mockResolvedValue({ name: 'Tools' }),
            findById: jest.fn().mockResolvedValue({ categoryId: '1' }),
          },
        },
      ],
    }).compile();

    controller = module.get<CategoriesController>(CategoriesController);
    service = module.get<CategoriesService>(CategoriesService);
  });

  it('creates category', async () => {
    const dto: CreateCategoryDto = { name: 'Tools' };
    const result = await controller.create(dto);
    expect(service.create).toHaveBeenCalledWith(dto);
    expect(result.name).toBe('Tools');
  });

  it('gets category by id', async () => {
    const result = await controller.findOne('1');
    expect(service.findById).toHaveBeenCalledWith('1');
    expect(result.categoryId).toBe('1');
  });
});
