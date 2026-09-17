import {
  Controller,
  Get,
  Body,
  NotFoundException,
  Param,
  Patch,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { PrismaService } from '../prisma/prisma.service.js';
import { RolesGuard } from '../auth/roles.guard.js';
import { Roles } from '../auth/roles.decorator.js';
import { UpdateUserRoleDto } from './dto/update-user-role.dto.js';
import { ApiErrorResponseDto } from '../common/dto/api-error-response.dto.js';
import {
  AdminStatsResponseDto,
  UserResponseDto,
} from '../common/dto/responses.dto.js';

@UseGuards(AuthGuard('jwt'), RolesGuard)
@Roles('ADMIN') // ONLY admins can access this controller!
@ApiBearerAuth('access-token')
@ApiTags('Admin')
@Controller('admin')
export class AdminController {
  constructor(private prisma: PrismaService) {}

  @Get('users')
  @ApiOperation({ summary: 'List users with todo counts' })
  @ApiResponse({ status: 200, type: [UserResponseDto] })
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
  @ApiOperation({ summary: 'Get basic platform statistics' })
  @ApiResponse({ status: 200, type: AdminStatsResponseDto })
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
  @ApiOperation({ summary: 'Update a user role' })
  @ApiResponse({ status: 200, type: UserResponseDto })
  @ApiResponse({ status: 404, type: ApiErrorResponseDto })
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
  @ApiOperation({ summary: 'Enable or disable a user' })
  @ApiResponse({ status: 200, type: UserResponseDto })
  @ApiResponse({ status: 404, type: ApiErrorResponseDto })
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
