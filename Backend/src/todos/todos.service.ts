// src/todos/todos.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { CreateTodoDto } from './dto/create-todo.dto.js';
import { UpdateTodoDto } from './dto/update-todo.dto.js';
import { QueryTodoDto } from './dto/query-todo.dto.js';
import { Prisma } from '@prisma/client';

@Injectable()
export class TodosService {
  constructor(private prisma: PrismaService) {}

  async create(createTodoDto: CreateTodoDto, userId: string) {
    return this.prisma.todo.create({
      data: {
        ...createTodoDto,
        description: createTodoDto.description || '',
        userId,
      },
    });
  }

  async findAll(userId: string, query: QueryTodoDto) {
    const {
      search,
      filter = 'all',
      sortBy = 'created_at',
      sortOrder = 'desc',
      page = 1,
      limit = 10,
    } = query;

    const where: Prisma.TodoWhereInput = { userId };

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
    const todo = await this.prisma.todo.findFirst({ where: { id, userId } });
    if (!todo) throw new NotFoundException('Todo not found');
    return todo;
  }

  async update(id: string, updateTodoDto: UpdateTodoDto, userId: string) {
    await this.findOne(id, userId);
    return this.prisma.todo.update({ where: { id }, data: updateTodoDto });
  }

  async remove(id: string, userId: string) {
    await this.findOne(id, userId);
    return this.prisma.todo.delete({ where: { id } });
  }
}
