// src/todos/todos.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateTodoDto } from './dto/create-todo.dto.js';
import { UpdateTodoDto } from './dto/update-todo.dto.js';
import { PrismaService } from '../prisma/prisma.service.js';

@Injectable()
export class TodosService {
  constructor(private prisma: PrismaService) {}

  async create(createTodoDto: CreateTodoDto) {
    return this.prisma.todo.create({
      data: {
        title: createTodoDto.title,
        description: createTodoDto.description || '',
        completed: createTodoDto.completed || false,
        status: createTodoDto.status || 'todo',
        progress: createTodoDto.progress || 0,
        dueDate: createTodoDto.dueDate || new Date().toLocaleDateString(),
        comments: createTodoDto.comments || 0,
        attachments: createTodoDto.attachments || 0,
      },
    });
  }

  async findAll() {
    // Return all tasks, ordered by creation date
    return this.prisma.todo.findMany({
      orderBy: { created_at: 'asc' },
    });
  }

  async findOne(id: string) {
    const todo = await this.prisma.todo.findUnique({
      where: { id },
    });
    if (!todo) {
      throw new NotFoundException(`Todo with ID ${id} not found`);
    }
    return todo;
  }

  async update(id: string, updateTodoDto: UpdateTodoDto) {
    // Ensure the record exists first
    await this.findOne(id);

    // Sync 'completed' boolean with Kanban 'status' if needed
    if (updateTodoDto.status === 'done') {
      updateTodoDto.completed = true;
    } else if (updateTodoDto.status === 'todo' || updateTodoDto.status === 'in-progress') {
      updateTodoDto.completed = false;
    }

    return this.prisma.todo.update({
      where: { id },
      data: updateTodoDto,
    });
  }

  async remove(id: string) {
    await this.findOne(id); // Ensure it exists before deleting
    
    return this.prisma.todo.delete({
      where: { id },
    });
  }
}
