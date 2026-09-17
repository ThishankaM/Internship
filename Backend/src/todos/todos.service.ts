// src/todos/todos.service.ts
import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { CreateTodoDto } from './dto/create-todo.dto.js';
import { UpdateTodoDto } from './dto/update-todo.dto.js';
import { QueryTodoDto } from './dto/query-todo.dto.js';
import { Prisma } from '@prisma/client';

@Injectable()
export class TodosService {
  constructor(private prisma: PrismaService) {}

  async create(createTodoDto: CreateTodoDto, userId: string) {
    const { categoryId, tagIds, ...rest } = createTodoDto;
    if (rest.status === 'done') rest.progress = 100;

    await this.validateRelations(categoryId, tagIds, userId);

    return this.prisma.todo.create({
      data: {
        ...rest,
        userId,
        categoryId: categoryId ?? null,
        tags: tagIds?.length
          ? { connect: tagIds.map((tagId) => ({ id: tagId })) }
          : undefined,
      },
      include: { category: true, tags: true },
    });
  }

  async findAll(userId: string, query: QueryTodoDto) {
    const {
      search,
      categoryId,
      tagId,
      filter = 'all',
      sortBy = 'created_at',
      sortOrder = 'desc',
      page = 1,
      limit = 10,
    } = query;

    const where: Prisma.TodoWhereInput = { userId };

    if (categoryId) where.categoryId = categoryId;
    if (tagId) where.tags = { some: { id: tagId } };

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (filter === 'completed') where.completed = true;
    if (filter === 'active') where.completed = false;

    const orderBy = { [sortBy]: sortOrder } as Prisma.TodoOrderByWithRelationInput;
    const skip = (page - 1) * limit;

    const [data, total] = await this.prisma.$transaction([
      this.prisma.todo.findMany({
        where,
        orderBy,
        skip,
        take: limit,
        include: { category: true, tags: true },
      }),
      this.prisma.todo.count({ where }),
    ]);

    return {
      data,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string, userId: string) {
    const todo = await this.prisma.todo.findFirst({
      where: { id, userId },
      include: { category: true, tags: true },
    });
    if (!todo) throw new NotFoundException('Todo not found');
    return todo;
  }

  async update(id: string, updateTodoDto: UpdateTodoDto, userId: string) {
    await this.findOne(id, userId);

    const { categoryId, tagIds, ...rest } = updateTodoDto;
    if (rest.status === 'done') rest.progress = 100;

    await this.validateRelations(categoryId, tagIds, userId);

    return this.prisma.todo.update({
      where: { id },
      data: {
        ...rest,
        ...(categoryId !== undefined ? { categoryId } : {}),
        ...(tagIds !== undefined
          ? { tags: { set: tagIds.map((tagId) => ({ id: tagId })) } }
          : {}),
      },
      include: { category: true, tags: true },
    });
  }

  async remove(id: string, userId: string) {
    await this.findOne(id, userId);
    return this.prisma.todo.delete({ where: { id } });
  }

  private async validateRelations(
    categoryId?: string,
    tagIds?: string[],
    userId?: string,
  ) {
    if (categoryId) {
      const category = await this.prisma.category.findFirst({
        where: { id: categoryId, userId },
      });

      if (!category) {
        throw new BadRequestException('Category not found or access denied');
      }
    }

    if (tagIds?.length) {
      const ownedTagCount = await this.prisma.tag.count({
        where: {
          id: { in: tagIds },
          userId,
        },
      });

      if (ownedTagCount !== tagIds.length) {
        throw new BadRequestException('One or more tags are invalid');
      }
    }
  }
}
