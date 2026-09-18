import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class AuthTokensResponseDto {
  @ApiProperty()
  access_token: string;

  @ApiProperty()
  refresh_token: string;
}

export class MessageResponseDto {
  @ApiProperty()
  message: string;
}

export class ForgotPasswordResponseDto extends MessageResponseDto {
  @ApiPropertyOptional({
    description:
      'Returned only for the simulated reset flow when email delivery is disabled.',
  })
  resetToken?: string;
}

export class CategoryResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  name: string;

  @ApiProperty()
  userId: string;

  @ApiProperty()
  created_at: string;

  @ApiPropertyOptional({ example: { todos: 3 } })
  _count?: { todos: number };
}

export class TagResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  name: string;

  @ApiProperty()
  userId: string;

  @ApiProperty()
  created_at: string;

  @ApiPropertyOptional({ example: { todos: 3 } })
  _count?: { todos: number };
}

export class ProjectResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  name: string;

  @ApiPropertyOptional({ nullable: true })
  description: string | null;

  @ApiPropertyOptional({ nullable: true })
  color: string | null;

  @ApiPropertyOptional({ nullable: true })
  icon: string | null;

  @ApiProperty()
  status: string;

  @ApiPropertyOptional({ nullable: true })
  dueDate: string | null;

  @ApiProperty()
  userId: string;

  @ApiProperty()
  created_at: string;

  @ApiProperty()
  updated_at: string;

  @ApiPropertyOptional()
  _count?: { todos: number };

  @ApiPropertyOptional()
  stats?: { total: number; completed: number; progress: number; active: number };
}

export class TodoResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  title: string;

  @ApiPropertyOptional({ nullable: true })
  description: string | null;

  @ApiProperty()
  completed: boolean;

  @ApiProperty({ enum: ['todo', 'in-progress', 'done'] })
  status: string;

  @ApiProperty({ enum: ['LOW', 'MEDIUM', 'HIGH'] })
  priority: string;

  @ApiProperty()
  progress: number;

  @ApiPropertyOptional({ nullable: true, example: '2026-09-20' })
  dueDate: string | null;

  @ApiPropertyOptional({ nullable: true })
  scheduledStart: string | null;

  @ApiPropertyOptional({ nullable: true })
  scheduledEnd: string | null;

  @ApiProperty()
  comments: number;

  @ApiProperty()
  attachments: number;

  @ApiProperty()
  userId: string;

  @ApiPropertyOptional({ type: CategoryResponseDto, nullable: true })
  category?: CategoryResponseDto | null;

  @ApiPropertyOptional({ type: ProjectResponseDto, nullable: true })
  project?: ProjectResponseDto | null;

  @ApiPropertyOptional({ nullable: true })
  projectId?: string | null;

  @ApiPropertyOptional({ type: [TagResponseDto] })
  tags?: TagResponseDto[];

  @ApiProperty()
  created_at: string;

  @ApiProperty()
  updated_at: string;
}

export class PaginatedTodosResponseDto {
  @ApiProperty({ type: [TodoResponseDto] })
  data: TodoResponseDto[];

  @ApiProperty({
    example: { page: 1, limit: 10, total: 1, totalPages: 1 },
  })
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export class UserResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  name: string;

  @ApiProperty()
  email: string;

  @ApiProperty({ enum: ['USER', 'ADMIN'] })
  role: string;

  @ApiProperty()
  isActive: boolean;

  @ApiProperty()
  created_at: string;

  @ApiPropertyOptional({ example: { todos: 5 } })
  _count?: { todos: number };
}

export class AdminStatsResponseDto {
  @ApiProperty()
  users: number;

  @ApiProperty()
  todos: number;

  @ApiProperty()
  completedTodos: number;

  @ApiProperty()
  activeTodos: number;
}
