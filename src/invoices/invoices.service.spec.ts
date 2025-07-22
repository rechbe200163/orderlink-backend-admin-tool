import { Test, TestingModule } from '@nestjs/testing';
import { InvoicesService } from './invoices.service';
import { InvoicesRepository } from './invoices.repository';

describe('InvoicesService', () => {
  let service: InvoicesService;
  let repository: InvoicesRepository;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        InvoicesService,
        {
          provide: InvoicesRepository,
          useValue: {
            create: jest.fn(),
            findAll: jest.fn(),
            findById: jest.fn(),
            update: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<InvoicesService>(InvoicesService);
    repository = module.get<InvoicesRepository>(InvoicesRepository);
  });

  it('creates invoice', async () => {
    const dto = { orderId: '1' } as any;
    (repository.create as jest.Mock).mockResolvedValue(dto);
    const result = await service.create(dto);
    expect(repository.create).toHaveBeenCalledWith(dto);
    expect(result).toBe(dto);
  });

  it('lists invoices', async () => {
    const res = { data: [], meta: {} } as any;
    (repository.findAll as jest.Mock).mockResolvedValue(res);
    const result = await service.findAll(5, 1);
    expect(repository.findAll).toHaveBeenCalledWith(5, 1);
    expect(result).toBe(res);
  });

  it('gets invoice by id', async () => {
    (repository.findById as jest.Mock).mockResolvedValue({ id: 1 });
    const result = await service.findById('1');
    expect(repository.findById).toHaveBeenCalledWith('1');
    expect(result).toEqual({ id: 1 });
  });

  it('updates invoice', async () => {
    (repository.update as jest.Mock).mockResolvedValue({ id: 1 });
    const dto = { total: 10 } as any;
    const result = await service.update('1', dto);
    expect(repository.update).toHaveBeenCalledWith('1', dto);
    expect(result).toEqual({ id: 1 });
  });
});
