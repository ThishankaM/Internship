import { Test, TestingModule } from '@nestjs/testing';
import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { AuthService } from './auth.service.js';
import { PrismaService } from '../prisma/prisma.service.js';

const bcryptMock = vi.hoisted(() => ({
  hash: vi.fn(),
  compare: vi.fn(),
}));

vi.mock('bcrypt', () => bcryptMock);

describe('AuthService', () => {
  let service: AuthService;

  const userMock = {
    findUnique: vi.fn(),
    findFirst: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
  };

  const jwtMock = {
    signAsync: vi.fn(),
    verifyAsync: vi.fn(),
  };

  beforeEach(async () => {
    vi.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: PrismaService,
          useValue: { user: userMock },
        },
        {
          provide: JwtService,
          useValue: jwtMock,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  const mockTokenGeneration = () => {
    jwtMock.signAsync
      .mockResolvedValueOnce('access-token')
      .mockResolvedValueOnce('refresh-token');
    bcryptMock.hash.mockResolvedValue('hashed-refresh-token');
  };

  describe('register', () => {
    it('creates a user and returns tokens', async () => {
      userMock.findUnique.mockResolvedValue(null);
      bcryptMock.hash.mockResolvedValueOnce('hashed-password');
      userMock.create.mockResolvedValue({
        id: 'user-1',
        email: 'user@example.com',
        role: 'USER',
      });
      mockTokenGeneration();

      const result = await service.register({
        name: 'Test User',
        email: 'user@example.com',
        password: 'secret123',
      });

      expect(userMock.create).toHaveBeenCalledWith({
        data: {
          name: 'Test User',
          email: 'user@example.com',
          password: 'hashed-password',
        },
      });
      expect(result).toEqual({
        access_token: 'access-token',
        refresh_token: 'refresh-token',
      });
    });

    it('throws when the email is already registered', async () => {
      userMock.findUnique.mockResolvedValue({ id: 'existing' });

      await expect(
        service.register({
          name: 'Test User',
          email: 'user@example.com',
          password: 'secret123',
        }),
      ).rejects.toBeInstanceOf(ConflictException);
    });
  });

  describe('login', () => {
    it('returns tokens for valid credentials', async () => {
      userMock.findUnique.mockResolvedValue({
        id: 'user-1',
        email: 'user@example.com',
        password: 'hashed-password',
        role: 'USER',
        isActive: true,
      });
      bcryptMock.compare.mockResolvedValue(true);
      mockTokenGeneration();

      await expect(
        service.login({ email: 'user@example.com', password: 'secret123' }),
      ).resolves.toEqual({
        access_token: 'access-token',
        refresh_token: 'refresh-token',
      });
    });

    it('throws for invalid credentials', async () => {
      userMock.findUnique.mockResolvedValue({
        id: 'user-1',
        password: 'hashed-password',
        role: 'USER',
        isActive: true,
      });
      bcryptMock.compare.mockResolvedValue(false);

      await expect(
        service.login({ email: 'user@example.com', password: 'bad' }),
      ).rejects.toBeInstanceOf(UnauthorizedException);
    });

    it('throws when the user is disabled', async () => {
      userMock.findUnique.mockResolvedValue({ isActive: false });

      await expect(
        service.login({ email: 'user@example.com', password: 'secret123' }),
      ).rejects.toBeInstanceOf(UnauthorizedException);
    });
  });

  describe('refresh', () => {
    it('returns fresh tokens when the refresh token is valid', async () => {
      jwtMock.verifyAsync.mockResolvedValue({ sub: 'user-1' });
      userMock.findUnique.mockResolvedValue({
        id: 'user-1',
        email: 'user@example.com',
        role: 'USER',
        refreshToken: 'hashed-old-token',
        isActive: true,
      });
      bcryptMock.compare.mockResolvedValue(true);
      mockTokenGeneration();

      await expect(service.refresh('old-token')).resolves.toEqual({
        access_token: 'access-token',
        refresh_token: 'refresh-token',
      });
    });

    it('throws when the refresh token is invalid', async () => {
      jwtMock.verifyAsync.mockResolvedValue({ sub: 'user-1' });
      userMock.findUnique.mockResolvedValue({
        id: 'user-1',
        refreshToken: 'hashed-old-token',
        isActive: true,
      });
      bcryptMock.compare.mockResolvedValue(false);

      await expect(service.refresh('bad-token')).rejects.toBeInstanceOf(
        ForbiddenException,
      );
    });
  });

  describe('changePassword', () => {
    it('updates the password and clears the refresh token', async () => {
      userMock.findUnique.mockResolvedValue({
        id: 'user-1',
        password: 'old-hash',
        isActive: true,
      });
      bcryptMock.compare
        .mockResolvedValueOnce(true)
        .mockResolvedValueOnce(false);
      bcryptMock.hash.mockResolvedValue('new-hash');

      await expect(
        service.changePassword('user-1', {
          currentPassword: 'old-password',
          newPassword: 'new-password',
        }),
      ).resolves.toEqual({ message: 'Password updated successfully' });

      expect(userMock.update).toHaveBeenCalledWith({
        where: { id: 'user-1' },
        data: {
          password: 'new-hash',
          refreshToken: null,
        },
      });
    });

    it('throws when the current password is wrong', async () => {
      userMock.findUnique.mockResolvedValue({
        id: 'user-1',
        password: 'old-hash',
        isActive: true,
      });
      bcryptMock.compare.mockResolvedValue(false);

      await expect(
        service.changePassword('user-1', {
          currentPassword: 'wrong',
          newPassword: 'new-password',
        }),
      ).rejects.toBeInstanceOf(BadRequestException);
    });
  });

  describe('forgotPassword / resetPassword', () => {
    it('creates a simulated reset token for an active user', async () => {
      userMock.findUnique.mockResolvedValue({
        id: 'user-1',
        email: 'user@example.com',
        isActive: true,
      });

      const result = await service.forgotPassword({
        email: 'user@example.com',
      });

      expect(result.resetToken).toEqual(expect.any(String));
      expect(userMock.update).toHaveBeenCalledWith({
        where: { id: 'user-1' },
        data: {
          resetToken: expect.any(String),
          resetTokenExpiresAt: expect.any(Date),
        },
      });
    });

    it('resets the password with a valid token', async () => {
      userMock.findFirst.mockResolvedValue({ id: 'user-1' });
      bcryptMock.hash.mockResolvedValue('new-password-hash');

      await expect(
        service.resetPassword({
          token: 'reset-token',
          newPassword: 'new-password',
        }),
      ).resolves.toEqual({ message: 'Password has been reset successfully' });

      expect(userMock.update).toHaveBeenCalledWith({
        where: { id: 'user-1' },
        data: {
          password: 'new-password-hash',
          resetToken: null,
          resetTokenExpiresAt: null,
          refreshToken: null,
        },
      });
    });

    it('throws when the reset token is invalid or expired', async () => {
      userMock.findFirst.mockResolvedValue(null);

      await expect(
        service.resetPassword({
          token: 'bad-token',
          newPassword: 'new-password',
        }),
      ).rejects.toBeInstanceOf(BadRequestException);
    });
  });
});
