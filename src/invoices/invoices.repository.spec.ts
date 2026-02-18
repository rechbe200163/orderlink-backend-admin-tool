import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { InvoicesRepository } from './invoices.repository';

const prismaMock = {
  client: {
    invoice: {
      create: jest.fn(),
      paginate: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
    },
  },
};

async function createModule() {
  return Test.createTestingModule({
    providers: [
      InvoicesRepository,
      { provide: 'prisma', useValue: prismaMock },
    ],
  }).compile();
}

describe('InvoicesRepository', () => {
  let repo: InvoicesRepository;

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await createModule();
    repo = module.get<InvoicesRepository>(InvoicesRepository);
  });

  it('creates invoice', async () => {
    const dto = { orderId: '1' } as any;
    prismaMock.db.invoice.findUnique.mockResolvedValue(null);
    prismaMock.db.invoice.create.mockResolvedValue(dto);
    const result = await repo.create(dto);
    expect(prismaMock.db.invoice.create).toHaveBeenCalledWith({ data: dto });
    expect(result).toEqual(dto);
  });

  it('throws on duplicate invoice', async () => {
    prismaMock.db.invoice.findUnique.mockResolvedValue({ id: 1 });
    await expect(repo.create({ orderId: '1' } as any)).rejects.toBeInstanceOf(
      BadRequestException,
    );
  });

  it('lists invoices', async () => {
    const withPages = jest.fn().mockResolvedValue([[{ id: 1 }], { count: 1 }]);
    prismaMock.db.invoice.paginate.mockReturnValue({ withPages });
    const result = await repo.findAll(5, 1);
    expect(withPages).toHaveBeenCalledWith({
      limit: 5,
      page: 1,
      includePageCount: true,
    });
    expect(result.data).toEqual([{ id: 1 }]);
  });

  it('finds by id', async () => {
    prismaMock.db.invoice.findUnique.mockResolvedValue({ id: 1 });
    const result = await repo.findById('1');
    expect(prismaMock.db.invoice.findUnique).toHaveBeenCalledWith({
      where: { invoiceId: '1' },
    });
    expect(result).toEqual({ id: 1 });
  });

  it('throws when invoice not found', async () => {
    prismaMock.db.invoice.findUnique.mockResolvedValue(null);
    await expect(repo.findById('2')).rejects.toBeInstanceOf(NotFoundException);
  });

  it('updates invoice', async () => {
    prismaMock.db.invoice.findUnique.mockResolvedValue({ id: 1, total: 5 });
    prismaMock.db.invoice.update.mockResolvedValue({ id: 1, total: 6 });
    const result = await repo.update('1', { total: 6 } as any);
    expect(prismaMock.db.invoice.update).toHaveBeenCalledWith({
      where: { invoiceId: '1' },
      data: { total: 6 },
    });
    expect(result).toEqual({ id: 1, total: 6 });
  });

  it('throws on update no change', async () => {
    prismaMock.db.invoice.findUnique.mockResolvedValue({ id: 1, total: 5 });
    await expect(repo.update('1', { total: 5 } as any)).rejects.toBeInstanceOf(
      BadRequestException,
    );
  });
});
