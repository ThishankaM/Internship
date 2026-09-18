import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { CreateProjectDto } from './dto/create-project.dto.js';
import { UpdateProjectDto } from './dto/update-project.dto.js';

@Injectable()
export class ProjectsService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateProjectDto, userId: string) {
    return this.prisma.project.create({
      data: {
        name: dto.name,
        description: dto.description,
        color: dto.color,
        icon: dto.icon,
        status: dto.status ?? 'active',
        dueDate: dto.dueDate,
        userId,
      },
      include: {
        _count: { select: { todos: true } },
      },
    });
  }

  async findAll(userId: string) {
    const projects = await this.prisma.project.findMany({
      where: { userId },
      include: {
        _count: { select: { todos: true } },
        todos: {
          select: { id: true, completed: true, status: true, progress: true },
        },
      },
      orderBy: { created_at: 'desc' },
    });

    // compute progress per project
    return projects.map((p: any) => {
      const total = p.todos.length;
      const completed = p.todos.filter((t: any) => t.completed || t.status === 'done').length;
      const progress = total === 0 ? 0 : Math.round((completed / total) * 100);
      const { todos: _todos, ...rest } = p as any;
      return {
        ...rest,
        stats: {
          total,
          completed,
          progress,
          active: total - completed,
        },
      };
    });
  }

  async findOne(id: string, userId: string) {
    const project = await this.prisma.project.findFirst({
      where: { id, userId },
      include: {
        _count: { select: { todos: true } },
        todos: {
          include: { category: true, tags: true, project: true },
          orderBy: { created_at: 'desc' },
        },
      },
    });
    if (!project) throw new NotFoundException('Project not found');
    const total = project.todos.length;
    const completed = project.todos.filter((t: any) => t.completed).length;
    const progress = total === 0 ? 0 : Math.round((completed / total) * 100);
    return {
      ...project,
      stats: { total, completed, progress, active: total - completed },
    };
  }

  async update(id: string, dto: UpdateProjectDto, userId: string) {
    await this.findOne(id, userId);
    return this.prisma.project.update({
      where: { id },
      data: {
        name: dto.name,
        description: dto.description,
        color: dto.color,
        icon: dto.icon,
        status: dto.status,
        dueDate: dto.dueDate,
      },
      include: { _count: { select: { todos: true } } },
    });
  }

  async remove(id: string, userId: string) {
    await this.findOne(id, userId);
    // detach todos (SET NULL via FK) or keep? Prisma will set null due to onDelete SetNull for todos relation? Actually Project->Todo is SetNull, so deleting project detaches.
    return this.prisma.project.delete({ where: { id } });
  }

  async getProjectTasks(id: string, userId: string) {
    await this.findOne(id, userId);
    return this.prisma.todo.findMany({
      where: { projectId: id, userId },
      include: { category: true, tags: true, project: true },
      orderBy: { created_at: 'desc' },
    });
  }
}
