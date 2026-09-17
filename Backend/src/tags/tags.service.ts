import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateTagDto } from './dto/create-tag.dto.js';
import { PrismaService } from '../prisma/prisma.service.js';

@Injectable()
export class TagsService {
  constructor(private prisma: PrismaService) {}

  create(createTagDto: CreateTagDto, userId: string) {
    return this.prisma.tag.create({
      data: {
        name: createTagDto.name,
        userId,
      },
    });
  }

  findAll(userId: string) {
    return this.prisma.tag.findMany({
      where: { userId },
      include: {
        _count: {
          select: { todos: true },
        },
      },
    });
  }

  async remove(id: string, userId: string) {
    const tag = await this.prisma.tag.findFirst({
      where: { id, userId },
    });

    if (!tag) {
      throw new NotFoundException('Tag not found');
    }

    return this.prisma.tag.delete({
      where: { id },
    });
  }
}
