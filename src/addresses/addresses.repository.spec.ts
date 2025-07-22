import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { AddressesRepository } from './addresses.repository';

const prismaMock = {
  client: {
    address: {
      create: jest.fn(),
      paginate: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
    },
  },
};

function createModule() {
  return Test.createTestingModule({
    providers: [
      AddressesRepository,
      { provide: 'PrismaService', useValue: prismaMock },
    ],
  }).compile();
}

describe('AddressesRepository', () => {
  let repository: AddressesRepository;

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await createModule();
    repository = module.get<AddressesRepository>(AddressesRepository);
  });

  it('creates address', async () => {
    const dto = { city: 'A' } as any;
    prismaMock.client.address.create.mockResolvedValue(dto);
    const result = await repository.create(dto);
    expect(prismaMock.client.address.create).toHaveBeenCalledWith({ data: dto });
    expect(result).toEqual(dto);
  });

  it('finds all addresses paging', async () => {
    const expected = [ { id: 1 } ];
    const withPages = jest.fn().mockResolvedValue([expected, { count: 1 }]);
    prismaMock.client.address.paginate.mockReturnValue({ withPages });
    const result = await repository.findAllPaging(10, 2, 'foo');
    expect(prismaMock.client.address.paginate).toHaveBeenCalled();
    expect(withPages).toHaveBeenCalledWith({ limit: 10, page: 2, includePageCount: true });
    expect(result.data).toEqual(expected);
  });

  it('finds all addresses', async () => {
    prismaMock.client.address.findMany.mockResolvedValue([]);
    const result = await repository.findAll();
    expect(prismaMock.client.address.findMany).toHaveBeenCalledWith({ where: { deleted: false } });
    expect(result).toEqual([]);
  });

  it('finds address by id', async () => {
    prismaMock.client.address.findUnique.mockResolvedValue({ id: 1 });
    const result = await repository.findById('1');
    expect(prismaMock.client.address.findUnique).toHaveBeenCalledWith({ where: { addressId: '1' } });
    expect(result).toEqual({ id: 1 });
  });

  it('throws when address not found', async () => {
    prismaMock.client.address.findUnique.mockResolvedValue(null);
    await expect(repository.findById('1')).rejects.toBeInstanceOf(NotFoundException);
  });

  it('updates address', async () => {
    prismaMock.client.address.findUnique.mockResolvedValue({ id: 1, city: 'A' });
    prismaMock.client.address.update.mockResolvedValue({ id: 1, city: 'B' });
    const result = await repository.update('1', { city: 'B' } as any);
    expect(prismaMock.client.address.update).toHaveBeenCalledWith({ where: { addressId: '1' }, data: { city: 'B' } });
    expect(result).toEqual({ id: 1, city: 'B' });
  });

  it('throws on no change', async () => {
    prismaMock.client.address.findUnique.mockResolvedValue({ id: 1, city: 'A' });
    await expect(repository.update('1', { city: 'A' } as any)).rejects.toBeInstanceOf(BadRequestException);
  });
});
