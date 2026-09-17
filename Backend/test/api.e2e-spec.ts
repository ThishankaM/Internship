import { Test, TestingModule } from '@nestjs/testing';
import {
  ConflictException,
  INestApplication,
  UnauthorizedException,
  ValidationPipe,
  VersioningType,
} from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from '../src/app.module.js';
import { PrismaService } from '../src/prisma/prisma.service.js';
import { AuthService } from '../src/auth/auth.service.js';
import { JwtService } from '@nestjs/jwt';

class FakeAuthService {
  constructor(private readonly jwtService: JwtService) {}

  private async tokens(email: string) {
    const access_token = await this.jwtService.signAsync(
      { sub: 'user-1', email, role: 'USER' },
      { expiresIn: '15m' },
    );
    const refresh_token = await this.jwtService.signAsync(
      { sub: 'user-1', email, role: 'USER' },
      { expiresIn: '7d' },
    );
    return { access_token, refresh_token };
  }

  async register(dto: { email: string; name: string; password: string }) {
    if (dto.email === 'existing@example.com') {
      throw new ConflictException('Email already exists');
    }
    return this.tokens(dto.email);
  }

  async login(dto: { email: string; password: string }) {
    if (dto.email !== 'user@example.com' || dto.password !== 'secret123') {
      throw new UnauthorizedException('Invalid credentials');
    }
    return this.tokens(dto.email);
  }

  async refresh() {
    return this.tokens('user@example.com');
  }

  async changePassword() {
    return { message: 'Password updated successfully' };
  }

  async forgotPassword() {
    return { message: 'If that email exists, password reset instructions have been sent.' };
  }

  async resetPassword() {
    return { message: 'Password has been reset successfully' };
  }
}

describe('Todo API (e2e)', () => {
  let app: INestApplication<App>;

  const todoMock = {
    create: vi.fn(),
    findMany: vi.fn(),
    findFirst: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    count: vi.fn(),
  };

  const prismaMock = {
    user: {
      findUnique: vi.fn(),
      findFirst: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
    },
    todo: todoMock,
    category: {
      findFirst: vi.fn(),
    },
    tag: {
      count: vi.fn(),
    },
    $transaction: vi.fn(),
  };

  beforeEach(async () => {
    vi.clearAllMocks();

    prismaMock.$transaction.mockImplementation((operations: Promise<unknown>[]) =>
      Promise.all(operations),
    );
    prismaMock.user.findUnique.mockResolvedValue({
      id: 'user-1',
      email: 'user@example.com',
      role: 'USER',
      isActive: true,
    });

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(PrismaService)
      .useValue(prismaMock)
      .overrideProvider(AuthService)
      .useFactory({
        factory: (jwtService: JwtService) => new FakeAuthService(jwtService),
        inject: [JwtService],
      })
      .compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('api');
    app.enableVersioning({
      type: VersioningType.URI,
      defaultVersion: '1',
    });
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );
    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  const login = async () => {
    const response = await request(app.getHttpServer())
      .post('/api/v1/auth/login')
      .send({ email: 'user@example.com', password: 'secret123' })
      .expect(201);

    return response.body.access_token as string;
  };

  it('registers a new user', async () => {
    const response = await request(app.getHttpServer())
      .post('/api/v1/auth/register')
      .send({
        name: 'New User',
        email: 'new@example.com',
        password: 'secret123',
      })
      .expect(201);

    expect(response.body).toEqual({
      access_token: expect.any(String),
      refresh_token: expect.any(String),
    });
  });

  it('rejects duplicate registration', async () => {
    await request(app.getHttpServer())
      .post('/api/v1/auth/register')
      .send({
        name: 'Existing',
        email: 'existing@example.com',
        password: 'secret123',
      })
      .expect(409);
  });

  it('rejects invalid login credentials', async () => {
    await request(app.getHttpServer())
      .post('/api/v1/auth/login')
      .send({ email: 'user@example.com', password: 'wrong-password' })
      .expect(401);
  });

  it('rejects unauthorized todo requests', async () => {
    await request(app.getHttpServer()).get('/api/v1/todos').expect(401);
  });

  it('creates a todo', async () => {
    const token = await login();
    todoMock.create.mockResolvedValue({
      id: 'todo-1',
      title: 'Ship backend',
      status: 'todo',
      category: null,
      tags: [],
    });

    const response = await request(app.getHttpServer())
      .post('/api/v1/todos')
      .set('Authorization', `Bearer ${token}`)
      .send({ title: 'Ship backend' })
      .expect(201);

    expect(response.body).toMatchObject({ id: 'todo-1', title: 'Ship backend' });
  });

  it('lists todos for the authenticated user', async () => {
    const token = await login();
    todoMock.findMany.mockResolvedValue([
      { id: 'todo-1', title: 'Ship backend' },
    ]);
    todoMock.count.mockResolvedValue(1);

    const response = await request(app.getHttpServer())
      .get('/api/v1/todos')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(response.body).toEqual({
      data: [{ id: 'todo-1', title: 'Ship backend' }],
      meta: {
        page: 1,
        limit: 10,
        total: 1,
        totalPages: 1,
      },
    });
  });

  it('updates an existing todo', async () => {
    const token = await login();
    todoMock.findFirst.mockResolvedValue({ id: 'todo-1', userId: 'user-1' });
    todoMock.update.mockResolvedValue({
      id: 'todo-1',
      title: 'Ship backend today',
      status: 'in-progress',
    });

    const response = await request(app.getHttpServer())
      .patch('/api/v1/todos/todo-1')
      .set('Authorization', `Bearer ${token}`)
      .send({ title: 'Ship backend today', status: 'in-progress' })
      .expect(200);

    expect(response.body).toMatchObject({
      id: 'todo-1',
      title: 'Ship backend today',
      status: 'in-progress',
    });
  });

  it('returns 404 when updating a non-existent todo', async () => {
    const token = await login();
    todoMock.findFirst.mockResolvedValue(null);

    await request(app.getHttpServer())
      .patch('/api/v1/todos/missing')
      .set('Authorization', `Bearer ${token}`)
      .send({ title: 'Does not matter' })
      .expect(404);
  });

  it('prevents accessing another user todo', async () => {
    const token = await login();
    todoMock.findFirst.mockResolvedValue(null);

    await request(app.getHttpServer())
      .patch('/api/v1/todos/other-user-todo')
      .set('Authorization', `Bearer ${token}`)
      .send({ title: 'Should not update' })
      .expect(404);
  });

  it('deletes a todo', async () => {
    const token = await login();
    todoMock.findFirst.mockResolvedValue({ id: 'todo-1', userId: 'user-1' });
    todoMock.delete.mockResolvedValue({ id: 'todo-1' });

    await request(app.getHttpServer())
      .delete('/api/v1/todos/todo-1')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);
  });
});
