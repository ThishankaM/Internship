import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { TagsService } from './tags.service.js';
import { PrismaService } from '../prisma/prisma.service.js';

describe('TagsService', () => {
  let service: TagsService;

  const tagMock = {
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
        TagsService,
        {
          provide: PrismaService,
          useValue: { tag: tagMock },
        },
      ],
    }).compile();

    service = module.get<TagsService>(TagsService);
  });

  it('creates a tag for the current user', () => {
    service.create({ name: 'backend' }, 'user-1');
    expect(tagMock.create).toHaveBeenCalledWith({
      data: { name: 'backend', userId: 'user-1' },
    });
  });

  it('lists only the current user tags', () => {
    service.findAll('user-1');
    expect(tagMock.findMany).toHaveBeenCalledWith({
      where: { userId: 'user-1' },
      include: { _count: { select: { todos: true } } },
    });
  });

  it('throws when updating a foreign tag', async () => {
    tagMock.findFirst.mockResolvedValue(null);

    await expect(
      service.update('tag-1', { name: 'frontend' }, 'user-2'),
    ).rejects.toBeInstanceOf(NotFoundException);
  });
});
