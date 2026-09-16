import { Test, TestingModule } from '@nestjs/testing';
import { TodosService } from './todos.service.js';
import { PrismaService } from '../prisma/prisma.service.js';

describe('TodosService', () => {
  let service: TodosService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [TodosService, PrismaService],
    }).compile();

    service = module.get<TodosService>(TodosService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
