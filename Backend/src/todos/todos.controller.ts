// src/todos/todos.controller.ts
import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request } from '@nestjs/common';
import { TodosService } from './todos.service.js';
import { CreateTodoDto } from './dto/create-todo.dto.js';
import { UpdateTodoDto } from './dto/update-todo.dto.js';
import { AuthGuard } from '@nestjs/passport';
import type { AuthenticatedRequest } from '../auth/authenticated-request.js';

@UseGuards(AuthGuard('jwt'))
@Controller('todos')
export class TodosController {
  constructor(private readonly todosService: TodosService) {}

  @Post()
  create(@Body() createTodoDto: CreateTodoDto, @Request() req: AuthenticatedRequest) {
    return this.todosService.create(createTodoDto, req.user.id);
  }

  @Get()
  findAll(@Request() req: AuthenticatedRequest) {
    return this.todosService.findAll(req.user.id);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Request() req: AuthenticatedRequest) {
    return this.todosService.findOne(id, req.user.id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateTodoDto: UpdateTodoDto, @Request() req: AuthenticatedRequest) {
    return this.todosService.update(id, updateTodoDto, req.user.id);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Request() req: AuthenticatedRequest) {
    return this.todosService.remove(id, req.user.id);
  }
}
