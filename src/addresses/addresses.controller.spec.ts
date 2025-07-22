import { Test, TestingModule } from '@nestjs/testing';
import { AddressesController } from './addresses.controller';
import { AddressesService } from './addresses.service';

const serviceMock = {
  create: jest.fn(),
  findAllPaging: jest.fn(),
  findAll: jest.fn(),
  findById: jest.fn(),
  update: jest.fn(),
};

describe('AddressesController', () => {
  let controller: AddressesController;

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AddressesController],
      providers: [{ provide: AddressesService, useValue: serviceMock }],
    }).compile();

    controller = module.get<AddressesController>(AddressesController);
  });

  it('creates an address', () => {
    const dto = { city: 'A' } as any;
    controller.create(dto);
    expect(serviceMock.create).toHaveBeenCalledWith(dto);
  });

  it('lists addresses with paging', () => {
    controller.findAll(5, 1, 'foo');
    expect(serviceMock.findAllPaging).toHaveBeenCalledWith(5, 1, 'foo');
  });

  it('lists all addresses', () => {
    controller.findAllAddresses();
    expect(serviceMock.findAll).toHaveBeenCalled();
  });

  it('gets address by id', () => {
    controller.findOne('1');
    expect(serviceMock.findById).toHaveBeenCalledWith('1');
  });

  it('updates an address', () => {
    const dto = { city: 'B' } as any;
    controller.update('1', dto);
    expect(serviceMock.update).toHaveBeenCalledWith('1', dto);
  });
});
