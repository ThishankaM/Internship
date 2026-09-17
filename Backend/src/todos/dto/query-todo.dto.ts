// src/todos/dto/query-todo.dto.ts
import { IsOptional, IsString, IsIn, IsInt, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class QueryTodoDto {
  @ApiPropertyOptional()
  @IsOptional() @IsString()
  search?: string;

  @ApiPropertyOptional()
  @IsOptional() @IsString()
  categoryId?: string;

  @ApiPropertyOptional()
  @IsOptional() @IsString()
  tagId?: string;

  @ApiPropertyOptional({ enum: ['all', 'active', 'completed'] })
  @IsOptional() @IsIn(['all', 'active', 'completed'])
  filter?: 'all' | 'active' | 'completed';

  @ApiPropertyOptional({
    enum: ['created_at', 'updated_at', 'title', 'completed', 'dueDate', 'priority'],
  })
  @IsOptional()
  @IsIn(['created_at', 'updated_at', 'title', 'completed', 'dueDate', 'priority'])
  sortBy?: 'created_at' | 'updated_at' | 'title' | 'completed' | 'dueDate' | 'priority';

  @ApiPropertyOptional({ enum: ['asc', 'desc'] })
  @IsOptional() @IsIn(['asc', 'desc'])
  sortOrder?: 'asc' | 'desc';

  @ApiPropertyOptional({ minimum: 1 })
  @IsOptional() @Type(() => Number) @IsInt() @Min(1)
  page?: number;

  @ApiPropertyOptional({ minimum: 1 })
  @IsOptional() @Type(() => Number) @IsInt() @Min(1)
  limit?: number;
}
