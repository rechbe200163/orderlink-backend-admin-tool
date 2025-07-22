import { Test, TestingModule } from '@nestjs/testing';
import { AddressesController } from './addresses.controller';
import { AddressesService } from './addresses.service';
import { CreateAddressDto } from 'prisma/src/generated/dto/create-address.dto';

describe('AddressesController', () => {
  let controller: AddressesController;
  let service: AddressesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AddressesController],
      providers: [
        {
          provide: AddressesService,
          useValue: {
            create: jest.fn().mockResolvedValue({ city: 'TestCity' }),
            findById: jest.fn().mockResolvedValue({ addressId: '1' }),
          },
        },
      ],
    }).compile();

    controller = module.get<AddressesController>(AddressesController);
    service = module.get<AddressesService>(AddressesService);
  });

  it('creates an address', async () => {
    const dto: CreateAddressDto = {
      city: 'TestCity',
      country: 'TC',
      postCode: '12345',
      state: 'TS',
      streetName: 'Main',
      streetNumber: '1',
    };
    const result = await controller.create(dto);
    expect(service.create).toHaveBeenCalledWith(dto);
    expect(result.city).toBe('TestCity');
  });

  it('gets address by id', async () => {
    const result = await controller.findOne('1');
    expect(service.findById).toHaveBeenCalledWith('1');
    expect(result.addressId).toBe('1');
  });
});
