import { Test, TestingModule } from '@nestjs/testing';
import { AddressesService } from './addresses.service';
import { AddressesRepository } from './addresses.repository';
import { CreateAddressDto } from 'prisma/src/generated/dto/create-address.dto';

const sample = { addressId: '1', city: 'TestCity' } as any;

describe('AddressesService', () => {
  let service: AddressesService;
  let repo: AddressesRepository;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AddressesService,
        {
          provide: AddressesRepository,
          useValue: {
            create: jest.fn().mockResolvedValue(sample),
            findById: jest.fn().mockResolvedValue(sample),
          },
        },
      ],
    }).compile();

    service = module.get<AddressesService>(AddressesService);
    repo = module.get<AddressesRepository>(AddressesRepository);
  });

  it('creates address via repository', async () => {
    const dto: CreateAddressDto = {
      city: 'TestCity',
      country: 'TC',
      postCode: '12345',
      state: 'TS',
      streetName: 'Main',
      streetNumber: '1',
    };
    const result = await service.create(dto);
    expect(repo.create).toHaveBeenCalledWith(dto);
    expect(result.addressId).toBe('1');
  });

  it('gets address by id', async () => {
    const result = await service.findById('1');
    expect(repo.findById).toHaveBeenCalledWith('1');
    expect(result.city).toBe('TestCity');
  });
});
