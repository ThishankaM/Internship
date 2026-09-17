import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { CategoriesService } from './categories.service.js';
import { PrismaService } from '../prisma/prisma.service.js';

describe('CategoriesService', () => {
  let service: CategoriesService;

  const categoryMock = {
    create: vi.fn(),
    findMany: vi.fn(),
    findFirst: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  };

  beforeEach(async () => {
    vi.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CategoriesService,
        {
          provide: PrismaService,
          useValue: { category: categoryMock },
        },
      ],
    }).compile();

    service = module.get<CategoriesService>(CategoriesService);
  });

  it('creates a category for the current user', () => {
    service.create({ name: 'Work' }, 'user-1');
    expect(categoryMock.create).toHaveBeenCalledWith({
      data: { name: 'Work', userId: 'user-1' },
    });
  });

  it('lists only the current user categories', () => {
    service.findAll('user-1');
    expect(categoryMock.findMany).toHaveBeenCalledWith({
      where: { userId: 'user-1' },
      include: { _count: { select: { todos: true } } },
    });
  });

  it('updates a category owned by the user', async () => {
    categoryMock.findFirst.mockResolvedValue({ id: 'category-1' });

    await service.update('category-1', { name: 'Personal' }, 'user-1');

    expect(categoryMock.update).toHaveBeenCalledWith({
      where: { id: 'category-1' },
      data: { name: 'Personal' },
    });
  });

  it('throws when updating a foreign category', async () => {
    categoryMock.findFirst.mockResolvedValue(null);

    await expect(
      service.update('category-1', { name: 'Personal' }, 'user-2'),
    ).rejects.toBeInstanceOf(NotFoundException);
  });
});
