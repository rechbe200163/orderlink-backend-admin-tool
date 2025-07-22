import { Test, TestingModule } from '@nestjs/testing';
import { AddressesService } from './addresses.service';
import { AddressesRepository } from './addresses.repository';

describe('AddressesService', () => {
  let service: AddressesService;
  let repository: AddressesRepository;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AddressesService,
        {
          provide: AddressesRepository,
          useValue: {
            create: jest.fn(),
            findAllPaging: jest.fn(),
            findAll: jest.fn(),
            findById: jest.fn(),
            update: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<AddressesService>(AddressesService);
    repository = module.get<AddressesRepository>(AddressesRepository);
  });

  it('creates a new address', async () => {
    const dto = { streetName: 'Main' } as any;
    (repository.create as jest.Mock).mockResolvedValue(dto);
    const result = await service.create(dto);
    expect(repository.create).toHaveBeenCalledWith(dto);
    expect(result).toBe(dto);
  });

  it('gets all addresses with paging', async () => {
    const paging = { data: [], meta: {} } as any;
    (repository.findAllPaging as jest.Mock).mockResolvedValue(paging);
    const result = await service.findAllPaging(5, 1, 'foo');
    expect(repository.findAllPaging).toHaveBeenCalledWith(5, 1, 'foo');
    expect(result).toBe(paging);
  });

  it('gets all addresses', async () => {
    const list = [] as any;
    (repository.findAll as jest.Mock).mockResolvedValue(list);
    const result = await service.findAll();
    expect(repository.findAll).toHaveBeenCalled();
    expect(result).toBe(list);
  });

  it('gets address by id', async () => {
    const item = { id: '1' } as any;
    (repository.findById as jest.Mock).mockResolvedValue(item);
    const result = await service.findById('1');
    expect(repository.findById).toHaveBeenCalledWith('1');
    expect(result).toBe(item);
  });

  it('updates an address', async () => {
    const dto = { city: 'Berlin' } as any;
    (repository.update as jest.Mock).mockResolvedValue(dto);
    const result = await service.update('1', dto);
    expect(repository.update).toHaveBeenCalledWith('1', dto);
    expect(result).toBe(dto);
  });
});
