import { Controller, Post, Body, Get, UseGuards, Request } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AuthService } from './auth.service.js';
import { RegisterDto, LoginDto } from './dto/auth.dto.js';
import type { AuthenticatedRequest } from './authenticated-request.js';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  @Post('login')
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('me')
  getMe(@Request() req: AuthenticatedRequest) {
    return req.user;
  }
}
