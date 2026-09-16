import { 
  IsString, 
  IsNotEmpty, 
  IsOptional, 
  IsBoolean, 
  IsNumber, 
  IsIn 
} from 'class-validator';

export class CreateTodoDto {
  // Required assignment validations
  @IsString()
  @IsNotEmpty({ message: 'Title cannot be empty' })
  title: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsBoolean()
  @IsOptional()
  completed?: boolean;

  // Extra fields to support our Kanban UI
  @IsString()
  @IsOptional()
  @IsIn(['todo', 'in-progress', 'done'])
  status?: 'todo' | 'in-progress' | 'done';

  @IsNumber()
  @IsOptional()
  progress?: number;

  @IsString()
  @IsOptional()
  dueDate?: string;

  @IsNumber()
  @IsOptional()
  comments?: number;

  @IsNumber()
  @IsOptional()
  attachments?: number;
}