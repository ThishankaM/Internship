import {
  Controller,
  Get,
  NotFoundException,
  Param,
  Patch,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { PrismaService } from '../prisma/prisma.service.js';
import { RolesGuard } from '../auth/roles.guard.js';
import { Roles } from '../auth/roles.decorator.js';

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
