// src/todos/todos.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { CreateTodoDto } from './dto/create-todo.dto.js';
import { UpdateTodoDto } from './dto/update-todo.dto.js';

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

  async findAll(userId: string) {
    return this.prisma.todo.findMany({
      where: { userId },
      orderBy: { created_at: 'asc' },
    });
  }

  async findOne(id: string, userId: string) {
    const todo = await this.prisma.todo.findFirst({
      where: { id, userId },
    });
    if (!todo) {
      throw new NotFoundException('Todo not found');
    }
    return todo;
  }

  async update(id: string, updateTodoDto: UpdateTodoDto, userId: string) {
    await this.findOne(id, userId);
    return this.prisma.todo.update({
      where: { id },
      data: updateTodoDto,
    });
  }

  async remove(id: string, userId: string) {
    await this.findOne(id, userId);
    return this.prisma.todo.delete({
      where: { id },
    });
  }
}
