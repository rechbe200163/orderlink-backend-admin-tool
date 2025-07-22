import { AddressesRepository } from './addresses.repository';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { CreateAddressDto } from 'prisma/src/generated/dto/create-address.dto';
import { UpdateAddressDto } from 'prisma/src/generated/dto/update-address.dto';

const sampleAddress = {
  addressId: '1',
  city: 'TestCity',
  country: 'TC',
  postCode: '12345',
  state: 'TS',
  streetName: 'Main',
  streetNumber: '1',
  deleted: false,
  modifiedAt: null,
};

function createRepository() {
  const create = jest.fn().mockResolvedValue(sampleAddress);
  const findMany = jest.fn().mockResolvedValue([sampleAddress]);
  const findUnique = jest.fn().mockResolvedValue(sampleAddress);
  const update = jest.fn().mockResolvedValue({ ...sampleAddress, city: 'NewCity' });
  const paginate = jest.fn(() => ({
    withPages: jest.fn().mockResolvedValue([[sampleAddress], { page: 1, total: 1 }]),
  }));

  const prisma = {
    client: {
      address: { create, findMany, findUnique, update, paginate },
    },
  } as any;

  const repo = new AddressesRepository(prisma);
  return { repo, prisma, create, findMany, findUnique, update, paginate };
}

describe('AddressesRepository', () => {
  it('creates a new address', async () => {
    const { repo, create } = createRepository();
    const dto: CreateAddressDto = {
      city: 'TestCity',
      country: 'TC',
      postCode: '12345',
      state: 'TS',
      streetName: 'Main',
      streetNumber: '1',
    };
    const result = await repo.create(dto);
    expect(create).toHaveBeenCalledWith({ data: dto });
    expect(result.city).toBe('TestCity');
  });

  it('finds an address by id', async () => {
    const { repo, findUnique } = createRepository();
    const result = await repo.findById('1');
    expect(findUnique).toHaveBeenCalledWith({ where: { addressId: '1' } });
    expect(result.addressId).toBe('1');
  });

  it('updates an address', async () => {
    const { repo, update } = createRepository();
    const dto: UpdateAddressDto = { city: 'NewCity' };
    const result = await repo.update('1', dto);
    expect(update).toHaveBeenCalledWith({ where: { addressId: '1' }, data: dto });
    expect(result.city).toBe('NewCity');
  });

  it('throws when update is a no-op', async () => {
    const { repo, findUnique } = createRepository();
    findUnique.mockResolvedValue(sampleAddress);
    await expect(repo.update('1', {})).rejects.toBeInstanceOf(BadRequestException);
  });

  it('throws when id is missing', async () => {
    const { repo, findUnique } = createRepository();
    findUnique.mockResolvedValue(null);
    await expect(repo.findById('missing')).rejects.toBeInstanceOf(NotFoundException);
  });
});
