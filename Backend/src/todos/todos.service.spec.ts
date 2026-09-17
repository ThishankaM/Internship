import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { TodosService } from './todos.service.js';
import { PrismaService } from '../prisma/prisma.service.js';

describe('TodosService', () => {
  let service: TodosService;

  const todoMock = {
    create: vi.fn(),
    findMany: vi.fn(),
    findFirst: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    count: vi.fn(),
  };

  const categoryMock = {
    findFirst: vi.fn(),
  };

  const tagMock = {
    count: vi.fn(),
  };

  const prismaMock = {
    todo: todoMock,
    category: categoryMock,
    tag: tagMock,
    $transaction: vi.fn(),
  };

  beforeEach(async () => {
    vi.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TodosService,
        {
          provide: PrismaService,
          useValue: prismaMock,
        },
      ],
    }).compile();

    service = module.get<TodosService>(TodosService);
  });

  describe('create', () => {
    it('creates a todo without relations', async () => {
      todoMock.create.mockResolvedValue({ id: 'todo-1', title: 'Task' });

      const result = await service.create({ title: 'Task' }, 'user-1');

      expect(todoMock.create).toHaveBeenCalledWith({
        data: {
          title: 'Task',
          userId: 'user-1',
          categoryId: null,
          tags: undefined,
        },
        include: { category: true, tags: true },
      });
      expect(result).toEqual({ id: 'todo-1', title: 'Task' });
    });

    it('creates a todo with owned category and tags', async () => {
      categoryMock.findFirst.mockResolvedValue({ id: 'category-1' });
      tagMock.count.mockResolvedValue(2);
      todoMock.create.mockResolvedValue({ id: 'todo-2' });

      await service.create(
        {
          title: 'Task',
          categoryId: 'category-1',
          tagIds: ['tag-1', 'tag-2'],
        },
        'user-1',
      );

      expect(categoryMock.findFirst).toHaveBeenCalledWith({
        where: { id: 'category-1', userId: 'user-1' },
      });
      expect(tagMock.count).toHaveBeenCalledWith({
        where: {
          id: { in: ['tag-1', 'tag-2'] },
          userId: 'user-1',
        },
      });
      expect(todoMock.create).toHaveBeenCalledWith({
        data: {
          title: 'Task',
          userId: 'user-1',
          categoryId: 'category-1',
          tags: {
            connect: [
              { id: 'tag-1' },
              { id: 'tag-2' },
            ],
          },
        },
        include: { category: true, tags: true },
      });
    });

    it('rejects a category owned by another user', async () => {
      categoryMock.findFirst.mockResolvedValue(null);

      await expect(
        service.create(
          { title: 'Task', categoryId: 'other-category' },
          'user-1',
        ),
      ).rejects.toBeInstanceOf(BadRequestException);
      expect(todoMock.create).not.toHaveBeenCalled();
    });

    it('rejects tags that are not all owned by the user', async () => {
      tagMock.count.mockResolvedValue(1);

      await expect(
        service.create(
          { title: 'Task', tagIds: ['tag-1', 'tag-2'] },
          'user-1',
        ),
      ).rejects.toBeInstanceOf(BadRequestException);
      expect(todoMock.create).not.toHaveBeenCalled();
    });
  });

  describe('findAll', () => {
    it('builds user-scoped filters and returns pagination metadata', async () => {
      todoMock.findMany.mockResolvedValue([{ id: 'todo-1' }]);
      todoMock.count.mockResolvedValue(1);
      prismaMock.$transaction.mockImplementation((operations: Promise<unknown>[]) =>
        Promise.all(operations),
      );

      const result = await service.findAll('user-1', {
        search: 'ship',
        categoryId: 'category-1',
        tagId: 'tag-1',
        filter: 'active',
        sortBy: 'title',
        sortOrder: 'asc',
        page: 2,
        limit: 5,
      });

      expect(todoMock.findMany).toHaveBeenCalledWith({
        where: {
          userId: 'user-1',
          categoryId: 'category-1',
          tags: { some: { id: 'tag-1' } },
          OR: [
            { title: { contains: 'ship', mode: 'insensitive' } },
            { description: { contains: 'ship', mode: 'insensitive' } },
          ],
          completed: false,
        },
        orderBy: { title: 'asc' },
        skip: 5,
        take: 5,
        include: { category: true, tags: true },
      });
      expect(result).toEqual({
        data: [{ id: 'todo-1' }],
        meta: {
          page: 2,
          limit: 5,
          total: 1,
          totalPages: 1,
        },
      });
    });
  });

  describe('findOne', () => {
    it('returns a todo when it belongs to the user', async () => {
      todoMock.findFirst.mockResolvedValue({ id: 'todo-1' });

      await expect(service.findOne('todo-1', 'user-1')).resolves.toEqual({
        id: 'todo-1',
      });
    });

    it('throws when the todo does not exist for the user', async () => {
      todoMock.findFirst.mockResolvedValue(null);

      await expect(service.findOne('missing', 'user-1')).rejects.toBeInstanceOf(
        NotFoundException,
      );
    });
  });

  describe('update', () => {
    it('updates a todo owned by the user', async () => {
      todoMock.findFirst.mockResolvedValue({ id: 'todo-1' });
      todoMock.update.mockResolvedValue({ id: 'todo-1', title: 'Updated' });

      const result = await service.update(
        'todo-1',
        { title: 'Updated' },
        'user-1',
      );

      expect(todoMock.update).toHaveBeenCalledWith({
        where: { id: 'todo-1' },
        data: { title: 'Updated' },
        include: { category: true, tags: true },
      });
      expect(result).toEqual({ id: 'todo-1', title: 'Updated' });
    });

    it('throws when updating a todo not owned by the user', async () => {
      todoMock.findFirst.mockResolvedValue(null);

      await expect(
        service.update('todo-1', { title: 'Updated' }, 'user-2'),
      ).rejects.toBeInstanceOf(NotFoundException);
      expect(todoMock.update).not.toHaveBeenCalled();
    });
  });

  describe('remove', () => {
    it('deletes a todo owned by the user', async () => {
      todoMock.findFirst.mockResolvedValue({ id: 'todo-1' });
      todoMock.delete.mockResolvedValue({ id: 'todo-1' });

      await service.remove('todo-1', 'user-1');

      expect(todoMock.delete).toHaveBeenCalledWith({ where: { id: 'todo-1' } });
    });

    it('throws when deleting a non-existent or foreign todo', async () => {
      todoMock.findFirst.mockResolvedValue(null);

      await expect(service.remove('todo-1', 'user-1')).rejects.toBeInstanceOf(
        NotFoundException,
      );
      expect(todoMock.delete).not.toHaveBeenCalled();
    });
  });
});
