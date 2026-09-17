// src/todos/dto/query-todo.dto.ts
import { IsOptional, IsString, IsIn, IsInt, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class QueryTodoDto {
  @IsOptional() @IsString()
  search?: string;

  @IsOptional() @IsString()
  categoryId?: string;

  @IsOptional() @IsString()
  tagId?: string;

  @IsOptional() @IsIn(['all', 'active', 'completed'])
  filter?: 'all' | 'active' | 'completed';

  @IsOptional()
  @IsIn(['created_at', 'updated_at', 'title', 'completed', 'dueDate', 'priority'])
  sortBy?: 'created_at' | 'updated_at' | 'title' | 'completed' | 'dueDate' | 'priority';

  @IsOptional() @IsIn(['asc', 'desc'])
  sortOrder?: 'asc' | 'desc';

  @IsOptional() @Type(() => Number) @IsInt() @Min(1)
  page?: number;

  @IsOptional() @Type(() => Number) @IsInt() @Min(1)
  limit?: number;
}
