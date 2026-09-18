import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsBoolean,
  IsNumber,
  IsIn,
  IsDateString,
  IsArray,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateTodoDto {
  @ApiProperty({ example: 'Design landing page' })
  @IsString()
  @IsNotEmpty({ message: 'Title cannot be empty' })
  title: string;

  @ApiPropertyOptional({ example: 'Create the initial landing page layout' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({ default: false })
  @IsBoolean()
  @IsOptional()
  completed?: boolean;

  @ApiPropertyOptional({ enum: ['todo', 'in-progress', 'done'] })
  @IsString()
  @IsOptional()
  @IsIn(['todo', 'in-progress', 'done'])
  status?: 'todo' | 'in-progress' | 'done';

  @ApiPropertyOptional({ minimum: 0, maximum: 100 })
  @IsNumber()
  @IsOptional()
  progress?: number;

  @ApiPropertyOptional({ enum: ['LOW', 'MEDIUM', 'HIGH'] })
  @IsIn(['LOW', 'MEDIUM', 'HIGH'])
  @IsOptional()
  priority?: 'LOW' | 'MEDIUM' | 'HIGH';

  @ApiPropertyOptional({ example: '2026-09-20' })
  @IsDateString()
  @IsOptional()
  dueDate?: string;

  @ApiPropertyOptional({ description: 'Scheduled start datetime ISO' })
  @IsDateString()
  @IsOptional()
  scheduledStart?: string;

  @ApiPropertyOptional({ description: 'Scheduled end datetime ISO' })
  @IsDateString()
  @IsOptional()
  scheduledEnd?: string;

  @ApiPropertyOptional()
  @IsNumber()
  @IsOptional()
  comments?: number;

  @ApiPropertyOptional()
  @IsNumber()
  @IsOptional()
  attachments?: number;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  categoryId?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  projectId?: string;

  @ApiPropertyOptional({ type: [String] })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  tagIds?: string[];
}
