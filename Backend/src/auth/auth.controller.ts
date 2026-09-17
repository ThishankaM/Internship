import { Controller, Post, Body, Get, UseGuards, Request } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { AuthService } from './auth.service.js';
import {
  RegisterDto,
  LoginDto,
  RefreshTokenDto,
  ChangePasswordDto,
  ForgotPasswordDto,
  ResetPasswordDto,
} from './dto/auth.dto.js';
import type { AuthenticatedRequest } from './authenticated-request.js';
import { ApiErrorResponseDto } from '../common/dto/api-error-response.dto.js';
import {
  AuthTokensResponseDto,
  ForgotPasswordResponseDto,
  MessageResponseDto,
  UserResponseDto,
} from '../common/dto/responses.dto.js';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @ApiOperation({ summary: 'Register a new user' })
  @ApiResponse({ status: 201, type: AuthTokensResponseDto })
  @ApiResponse({ status: 409, type: ApiErrorResponseDto })
  register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  @Post('login')
  @ApiOperation({ summary: 'Authenticate and receive access/refresh tokens' })
  @ApiResponse({ status: 201, type: AuthTokensResponseDto })
  @ApiResponse({ status: 401, type: ApiErrorResponseDto })
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  @Post('refresh')
  @ApiOperation({ summary: 'Rotate a refresh token' })
  @ApiResponse({ status: 201, type: AuthTokensResponseDto })
  @ApiResponse({ status: 403, type: ApiErrorResponseDto })
  refresh(@Body() dto: RefreshTokenDto) {
    return this.authService.refresh(dto.refreshToken);
  }

  @Post('forgot-password')
  @ApiOperation({ summary: 'Start the simulated password reset flow' })
  @ApiResponse({ status: 201, type: ForgotPasswordResponseDto })
  forgotPassword(@Body() dto: ForgotPasswordDto) {
    return this.authService.forgotPassword(dto);
  }

  @Post('reset-password')
  @ApiOperation({ summary: 'Reset a password using a reset token' })
  @ApiResponse({ status: 201, type: MessageResponseDto })
  @ApiResponse({ status: 400, type: ApiErrorResponseDto })
  resetPassword(@Body() dto: ResetPasswordDto) {
    return this.authService.resetPassword(dto);
  }

  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth('access-token')
  @Get('me')
  @ApiOperation({ summary: 'Get the authenticated user' })
  @ApiResponse({ status: 200, type: UserResponseDto })
  @ApiResponse({ status: 401, type: ApiErrorResponseDto })
  getMe(@Request() req: AuthenticatedRequest) {
    return req.user;
  }

  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth('access-token')
  @Post('change-password')
  @ApiOperation({ summary: 'Change the authenticated user password' })
  @ApiResponse({ status: 201, type: MessageResponseDto })
  @ApiResponse({ status: 400, type: ApiErrorResponseDto })
  changePassword(
    @Request() req: AuthenticatedRequest,
    @Body() dto: ChangePasswordDto,
  ) {
    return this.authService.changePassword(req.user.id, dto);
  }
}
