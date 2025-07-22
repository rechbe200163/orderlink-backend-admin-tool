import { Test, TestingModule } from '@nestjs/testing';
import { CategoriesService } from './categories.service';
import { CategoriesRepository } from './categories.repository';
import { CreateCategoryDto } from './dto/create-category.dto';

const sample = { categoryId: '1', name: 'Tools' } as any;

describe('CategoriesService', () => {
  let service: CategoriesService;
  let repo: CategoriesRepository;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CategoriesService,
        {
          provide: CategoriesRepository,
          useValue: {
            create: jest.fn().mockResolvedValue(sample),
            findById: jest.fn().mockResolvedValue(sample),
          },
        },
      ],
    }).compile();

    service = module.get<CategoriesService>(CategoriesService);
    repo = module.get<CategoriesRepository>(CategoriesRepository);
  });

  it('creates category through repository', async () => {
    const dto: CreateCategoryDto = { name: 'Tools' };
    const result = await service.create(dto);
    expect(repo.create).toHaveBeenCalledWith(dto);
    expect(result.categoryId).toBe('1');
  });

  it('finds category by id', async () => {
    const result = await service.findById('1');
    expect(repo.findById).toHaveBeenCalledWith('1');
    expect(result.name).toBe('Tools');
  });
});
