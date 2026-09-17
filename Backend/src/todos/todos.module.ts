import { Module } from '@nestjs/common';
import { TodosService } from './todos.service.js';
import { TodosController } from './todos.controller.js';
import { PrismaModule } from '../prisma/prisma.module.js';

@Module({
  imports: [PrismaModule],
  controllers: [TodosController],
  providers: [TodosService],
})
export class TodosModule {}
