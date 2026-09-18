// src/todos/todos.service.ts
import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { CreateTodoDto } from './dto/create-todo.dto.js';
import { UpdateTodoDto } from './dto/update-todo.dto.js';
import { QueryTodoDto } from './dto/query-todo.dto.js';

type TodoStatus = 'todo' | 'in-progress' | 'done';

function enforceProgressInvariant(input: {
  status?: TodoStatus;
  completed?: boolean;
  progress?: number;
}): { status?: TodoStatus; completed?: boolean; progress?: number } {
  let { status, completed, progress } = input;

  // If completed explicitly true, force done + 100
  if (completed === true) {
    return { status: 'done', completed: true, progress: 100 };
  }

  if (status === 'done') {
    return { status: 'done', completed: true, progress: 100 };
  }

  if (status === 'todo') {
    const p = progress ?? 0;
    return {
      status: 'todo',
      completed: false,
      progress: Math.max(0, Math.min(99, p)),
    };
  }

  if (status === 'in-progress') {
    let p = progress ?? 1;
    if (p <= 0) p = 1;
    if (p >= 100) p = 99;
    return { status: 'in-progress', completed: false, progress: p };
  }

  // status undefined, but progress/completed may be present
  if (progress !== undefined) {
    if (progress >= 100) {
      return { status: 'done', completed: true, progress: 100 };
    }
    if (progress > 0 && status === undefined) {
      // if progress >0 and no status, assume in-progress unless completed false explicitly
      if (completed === false) {
        return { completed: false, progress: Math.min(99, Math.max(0, progress)) };
      }
    }
  }

  // default: if completed false, ensure progress not 100
  if (completed === false && progress === 100) {
    return { completed: false, progress: 99 };
  }

  return { status, completed, progress };
}

@Injectable()
export class TodosService {
  constructor(private prisma: PrismaService) {}

  async create(createTodoDto: CreateTodoDto, userId: string) {
    const { categoryId, projectId, tagIds, scheduledStart, scheduledEnd, ...rest } = createTodoDto;

    const invariant = enforceProgressInvariant({
      status: rest.status as TodoStatus | undefined,
      completed: rest.completed,
      progress: rest.progress,
    });

    Object.assign(rest, invariant);

    await this.validateRelations(categoryId, projectId, tagIds, userId);

    // validate scheduled times
    if (scheduledStart && scheduledEnd) {
      const start = new Date(scheduledStart);
      const end = new Date(scheduledEnd);
      if (end <= start) {
        throw new BadRequestException('scheduledEnd must be after scheduledStart');
      }
    }

    return this.prisma.todo.create({
      data: {
        ...rest,
        userId,
        categoryId: categoryId ?? null,
        projectId: projectId ?? null,
        scheduledStart: scheduledStart ? new Date(scheduledStart) : undefined,
        scheduledEnd: scheduledEnd ? new Date(scheduledEnd) : undefined,
        tags: tagIds?.length
          ? { connect: tagIds.map((tagId) => ({ id: tagId })) }
          : undefined,
      },
      include: { category: true, tags: true, project: true },
    });
  }

  async findAll(userId: string, query: QueryTodoDto) {
    const {
      search,
      categoryId,
      tagId,
      projectId,
      filter = 'all',
      sortBy = 'created_at',
      sortOrder = 'desc',
      page = 1,
      limit = 10,
    } = query;

    const where: any = { userId };

    if (categoryId) where.categoryId = categoryId;
    if (projectId) where.projectId = projectId;
    if (tagId) where.tags = { some: { id: tagId } };

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (filter === 'completed') where.completed = true;
    if (filter === 'active') where.completed = false;

    const orderBy = { [sortBy]: sortOrder } as any;
    const skip = (page - 1) * limit;

    const [data, total] = await this.prisma.$transaction([
      this.prisma.todo.findMany({
        where,
        orderBy,
        skip,
        take: limit,
        include: { category: true, tags: true, project: true },
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
    const todo = await this.prisma.todo.findFirst({
      where: { id, userId },
      include: { category: true, tags: true, project: true },
    });
    if (!todo) throw new NotFoundException('Todo not found');
    return todo;
  }

  async update(id: string, updateTodoDto: UpdateTodoDto, userId: string) {
    await this.findOne(id, userId);

    const { categoryId, projectId, tagIds, scheduledStart, scheduledEnd, ...rest } = updateTodoDto;

    const invariant = enforceProgressInvariant({
      status: rest.status as TodoStatus | undefined,
      completed: rest.completed,
      progress: rest.progress,
    });

    Object.assign(rest, invariant);

    await this.validateRelations(categoryId, projectId, tagIds, userId);

    if (scheduledStart && scheduledEnd) {
      const start = new Date(scheduledStart);
      const end = new Date(scheduledEnd);
      if (end <= start) {
        throw new BadRequestException('scheduledEnd must be after scheduledStart');
      }
    }

    return this.prisma.todo.update({
      where: { id },
      data: {
        ...rest,
        ...(categoryId !== undefined ? { categoryId } : {}),
        ...(projectId !== undefined ? { projectId } : {}),
        ...(scheduledStart !== undefined
          ? { scheduledStart: scheduledStart ? new Date(scheduledStart) : null }
          : {}),
        ...(scheduledEnd !== undefined
          ? { scheduledEnd: scheduledEnd ? new Date(scheduledEnd) : null }
          : {}),
        ...(tagIds !== undefined
          ? { tags: { set: tagIds.map((tagId) => ({ id: tagId })) } }
          : {}),
      },
      include: { category: true, tags: true, project: true },
    });
  }

  async remove(id: string, userId: string) {
    await this.findOne(id, userId);
    return this.prisma.todo.delete({ where: { id } });
  }

  private async validateRelations(
    categoryId?: string,
    projectId?: string | null,
    tagIds?: string[],
    userId?: string,
  ) {
    if (categoryId) {
      const category = await this.prisma.category.findFirst({
        where: { id: categoryId, userId },
      });

      if (!category) {
        throw new BadRequestException('Category not found or access denied');
      }
    }

    if (projectId) {
      const project = await this.prisma.project.findFirst({
        where: { id: projectId, userId },
      });
      if (!project) {
        throw new BadRequestException('Project not found or access denied');
      }
    }

    if (tagIds?.length) {
      const ownedTagCount = await this.prisma.tag.count({
        where: {
          id: { in: tagIds },
          userId,
        },
      });

      if (ownedTagCount !== tagIds.length) {
        throw new BadRequestException('One or more tags are invalid');
      }
    }
  }
}
