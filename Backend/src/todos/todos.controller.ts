// src/todos/todos.controller.ts
import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request, Query } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { TodosService } from './todos.service.js';
import { CreateTodoDto } from './dto/create-todo.dto.js';
import { UpdateTodoDto } from './dto/update-todo.dto.js';
import { QueryTodoDto } from './dto/query-todo.dto.js';
import { AuthGuard } from '@nestjs/passport';
import type { AuthenticatedRequest } from '../auth/authenticated-request.js';
import { ApiErrorResponseDto } from '../common/dto/api-error-response.dto.js';
import {
  PaginatedTodosResponseDto,
  TodoResponseDto,
} from '../common/dto/responses.dto.js';

@UseGuards(AuthGuard('jwt'))
@ApiBearerAuth('access-token')
@ApiTags('Todos')
@Controller('todos')
export class TodosController {
  constructor(private readonly todosService: TodosService) {}

  @Post()
  @ApiOperation({ summary: 'Create a todo' })
  @ApiResponse({ status: 201, type: TodoResponseDto })
  @ApiResponse({ status: 400, type: ApiErrorResponseDto })
  create(@Body() createTodoDto: CreateTodoDto, @Request() req: AuthenticatedRequest) {
    return this.todosService.create(createTodoDto, req.user.id);
  }

  @Get()
  @ApiOperation({ summary: 'List todos for the authenticated user' })
  @ApiResponse({ status: 200, type: PaginatedTodosResponseDto })
  findAll(@Query() query: QueryTodoDto, @Request() req: AuthenticatedRequest) {
    return this.todosService.findAll(req.user.id, query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get one todo' })
  @ApiResponse({ status: 200, type: TodoResponseDto })
  @ApiResponse({ status: 404, type: ApiErrorResponseDto })
  findOne(@Param('id') id: string, @Request() req: AuthenticatedRequest) {
    return this.todosService.findOne(id, req.user.id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a todo' })
  @ApiResponse({ status: 200, type: TodoResponseDto })
  @ApiResponse({ status: 404, type: ApiErrorResponseDto })
  update(@Param('id') id: string, @Body() updateTodoDto: UpdateTodoDto, @Request() req: AuthenticatedRequest) {
    return this.todosService.update(id, updateTodoDto, req.user.id);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a todo' })
  @ApiResponse({ status: 200, type: TodoResponseDto })
  @ApiResponse({ status: 404, type: ApiErrorResponseDto })
  remove(@Param('id') id: string, @Request() req: AuthenticatedRequest) {
    return this.todosService.remove(id, req.user.id);
  }
}
