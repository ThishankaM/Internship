import {
  Injectable,
  UnauthorizedException,
  ForbiddenException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service.js';
import { JwtService } from '@nestjs/jwt';
import type { JwtSignOptions } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { randomBytes, createHash } from 'crypto';
import {
  RegisterDto,
  LoginDto,
  ChangePasswordDto,
  ForgotPasswordDto,
  ResetPasswordDto,
} from './dto/auth.dto.js';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async register(dto: RegisterDto) {
    const existingUser = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });
    if (existingUser) throw new ConflictException('Email already exists');

    const hashedPassword = await bcrypt.hash(
      dto.password,
      this.configService.get<number>('bcryptRounds', 10),
    );
    const user = await this.prisma.user.create({
      data: {
        name: dto.name,
        email: dto.email,
        password: hashedPassword,
      },
    });

    return this.generateTokens(user.id, user.email, user.role);
  }

  async login(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({ where: { email: dto.email } });
    if (!user || !user.isActive) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isValid = await bcrypt.compare(dto.password, user.password);
    if (!isValid) throw new UnauthorizedException('Invalid credentials');

    return this.generateTokens(user.id, user.email, user.role);
  }

  async refresh(refreshToken: string) {
    let payload: { sub: string };

    try {
      payload = await this.jwtService.verifyAsync<{ sub: string }>(refreshToken);
    } catch {
      throw new ForbiddenException('Access Denied');
    }

    const user = await this.prisma.user.findUnique({
      where: { id: payload.sub },
    });

    if (!user || !user.refreshToken || !user.isActive) {
      throw new ForbiddenException('Access Denied');
    }

    const rtMatches = await bcrypt.compare(refreshToken, user.refreshToken);
    if (!rtMatches) throw new ForbiddenException('Access Denied');

    return this.generateTokens(user.id, user.email, user.role);
  }

  async changePassword(userId: string, dto: ChangePasswordDto) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user || !user.isActive) {
      throw new UnauthorizedException('Access denied');
    }

    const currentPasswordMatches = await bcrypt.compare(
      dto.currentPassword,
      user.password,
    );

    if (!currentPasswordMatches) {
      throw new BadRequestException('Current password is incorrect');
    }

    const newPasswordMatchesCurrent = await bcrypt.compare(
      dto.newPassword,
      user.password,
    );

    if (newPasswordMatchesCurrent) {
      throw new BadRequestException(
        'New password must be different from the current password',
      );
    }

    const hashedPassword = await bcrypt.hash(
      dto.newPassword,
      this.configService.get<number>('bcryptRounds', 10),
    );

    await this.prisma.user.update({
      where: { id: userId },
      data: {
        password: hashedPassword,
        refreshToken: null,
      },
    });

    return { message: 'Password updated successfully' };
  }

  async forgotPassword(dto: ForgotPasswordDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (!user || !user.isActive) {
      return {
        message:
          'If that email exists, password reset instructions have been sent.',
      };
    }

    const resetToken = randomBytes(32).toString('hex');
    const hashedResetToken = this.hashToken(resetToken);
    const resetTokenExpiresAt = new Date(
      Date.now() +
        this.configService.get<number>('jwt.resetExpiresInMinutes', 15) *
          60 *
          1000,
    );

    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        resetToken: hashedResetToken,
        resetTokenExpiresAt,
      },
    });

    // Email integration is outside the scope of this assignment.
    // The token is returned so the simulated flow can be completed.
    return {
      message:
        'If that email exists, password reset instructions have been sent.',
      resetToken,
    };
  }

  async resetPassword(dto: ResetPasswordDto) {
    const hashedResetToken = this.hashToken(dto.token);
    const user = await this.prisma.user.findFirst({
      where: {
        resetToken: hashedResetToken,
        resetTokenExpiresAt: { gt: new Date() },
        isActive: true,
      },
    });

    if (!user) {
      throw new BadRequestException('Invalid or expired password reset token');
    }

    const hashedPassword = await bcrypt.hash(
      dto.newPassword,
      this.configService.get<number>('bcryptRounds', 10),
    );

    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        resetToken: null,
        resetTokenExpiresAt: null,
        refreshToken: null,
      },
    });

    return { message: 'Password has been reset successfully' };
  }

  private async generateTokens(userId: string, email: string, role: string) {
    const [at, rt] = await Promise.all([
      this.jwtService.signAsync(
        { sub: userId, email, role },
        {
          expiresIn: this.configService.get<string>(
            'jwt.accessExpiresIn',
            '15m',
          ) as JwtSignOptions['expiresIn'],
        },
      ),
      this.jwtService.signAsync(
        { sub: userId, email, role },
        {
          expiresIn: this.configService.get<string>(
            'jwt.refreshExpiresIn',
            '7d',
          ) as JwtSignOptions['expiresIn'],
        },
      ),
    ]);

    const hashedRt = await bcrypt.hash(
      rt,
      this.configService.get<number>('bcryptRounds', 10),
    );
    await this.prisma.user.update({
      where: { id: userId },
      data: { refreshToken: hashedRt },
    });

    return { access_token: at, refresh_token: rt };
  }

  private hashToken(token: string): string {
    return createHash('sha256').update(token).digest('hex');
  }
}
