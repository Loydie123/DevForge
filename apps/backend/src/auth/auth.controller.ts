import {
  Controller,
  Post,
  Get,
  Body,
  Req,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import type { Request } from 'express';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiBody } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { AuthGuard } from './auth.guard';
import { CurrentUser } from './current-user.decorator';
import * as Auth from '@devforge/auth';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @ApiOperation({ summary: 'Register a new user account' })
  @ApiBody({
    schema: {
      example: {
        email: 'user@example.com',
        password: 'password123',
        name: 'John Doe',
      },
    },
  })
  @Throttle({ short: { ttl: 60_000, limit: 5 } }) // 5 registrations/min per IP
  @Post('register')
  async register(
    @Body()
    dto: Auth.RegisterDto,
  ) {
    return this.authService.register(dto);
  }

  @ApiOperation({ summary: 'Login and receive a JWT token' })
  @ApiBody({
    schema: { example: { email: 'admin@devforge.com', password: 'admin123' } },
  })
  @Throttle({ short: { ttl: 60_000, limit: 10 } }) // 10 login attempts/min per IP
  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() dto: Auth.LoginDto, @Req() req: Request) {
    const ip =
      (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() ||
      req.socket.remoteAddress ||
      'unknown';
    return this.authService.login(dto, ip);
  }

  @ApiOperation({ summary: 'Logout and revoke the current JWT token' })
  @ApiBearerAuth()
  @Post('logout')
  @UseGuards(AuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  async logout(@Req() req: Request) {
    const token = (req.headers as Record<string, string>)[
      'authorization'
    ]?.split(' ')[1];
    if (token) await this.authService.logout(token);
  }

  @ApiOperation({ summary: 'Get current authenticated user profile' })
  @ApiBearerAuth()
  @Get('me')
  @UseGuards(AuthGuard)
  getMe(@CurrentUser() user: Auth.JwtPayload) {
    return user;
  }
}
