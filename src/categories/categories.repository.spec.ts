import { CategoriesRepository } from './categories.repository';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

const sampleCategory = {
  categoryId: '1',
  name: 'Tools',
  description: 'desc',
  imagePath: null,
  deleted: false,
};

function createRepository() {
  const create = jest.fn().mockResolvedValue(sampleCategory);
  const findUnique = jest.fn().mockResolvedValue(sampleCategory);
  const update = jest.fn().mockResolvedValue({ ...sampleCategory, name: 'Updated' });
  const paginate = jest.fn(() => ({
    withPages: jest.fn().mockResolvedValue([[sampleCategory], { page: 1, total: 1 }]),
  }));

  const prisma = {
    client: {
      category: { create, findUnique, update, paginate },
    },
  } as any;

  const repo = new CategoriesRepository(prisma);
  return { repo, create, findUnique, update };
}

describe('CategoriesRepository', () => {
  it('creates category', async () => {
    const { repo, create } = createRepository();
    const dto: CreateCategoryDto = { name: 'Tools' };
    const result = await repo.create(dto);
    expect(create).toHaveBeenCalledWith({ data: dto });
    expect(result.name).toBe('Tools');
  });

  it('updates category', async () => {
    const { repo, update } = createRepository();
    const dto: UpdateCategoryDto = { name: 'Updated' };
    const result = await repo.update('1', dto);
    expect(update).toHaveBeenCalledWith({ where: { categoryId: '1' }, data: dto });
    expect(result.name).toBe('Updated');
  });

  it('throws when no change', async () => {
    const { repo } = createRepository();
    await expect(repo.update('1', {})).rejects.toBeInstanceOf(BadRequestException);
  });

  it('throws when not found', async () => {
    const { repo, findUnique } = createRepository();
    findUnique.mockResolvedValue(null);
    await expect(repo.findById('missing')).rejects.toBeInstanceOf(NotFoundException);
  });
});
