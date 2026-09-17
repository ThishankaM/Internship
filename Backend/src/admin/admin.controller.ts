import {
  Controller,
  Get,
  Body,
  NotFoundException,
  Param,
  Patch,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { PrismaService } from '../prisma/prisma.service.js';
import { RolesGuard } from '../auth/roles.guard.js';
import { Roles } from '../auth/roles.decorator.js';
import { UpdateUserRoleDto } from './dto/update-user-role.dto.js';

@UseGuards(AuthGuard('jwt'), RolesGuard)
@Roles('ADMIN') // ONLY admins can access this controller!
@Controller('admin')
export class AdminController {
  constructor(private prisma: PrismaService) {}

  @Get('users')
  getUsers() {
    return this.prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isActive: true,
        created_at: true,
        _count: { select: { todos: true } },
      },
    });
  }

  @Get('stats')
  async getStats() {
    const [users, todos, completedTodos] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.todo.count(),
      this.prisma.todo.count({ where: { completed: true } }),
    ]);

    return {
      users,
      todos,
      completedTodos,
      activeTodos: todos - completedTodos,
    };
  }

  @Patch('users/:id/role')
  async updateUserRole(
    @Param('id') id: string,
    @Body() dto: UpdateUserRoleDto,
  ) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) throw new NotFoundException('User not found');

    return this.prisma.user.update({
      where: { id },
      data: { role: dto.role },
      select: { id: true, name: true, email: true, role: true, isActive: true },
    });
  }

  @Patch('users/:id/toggle-active')
  async toggleUser(@Param('id') id: string) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) throw new NotFoundException('User not found');

    return this.prisma.user.update({
      where: { id },
      data: { isActive: !user.isActive },
      select: { id: true, name: true, email: true, role: true, isActive: true },
    });
  }
}
