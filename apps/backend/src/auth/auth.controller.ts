import {
  Controller,
  Post,
  Get,
  Body,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { AuthService } from './auth.service';
import { AuthGuard } from './auth.guard';
import { CurrentUser } from './current-user.decorator';
import * as Auth from '@devforge/auth';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Throttle({ short: { ttl: 60_000, limit: 5 } }) // 5 registrations/min per IP
  @Post('register')
  async register(
    @Body()
    dto: Auth.RegisterDto,
  ) {
    return this.authService.register(dto);
  }

  @Throttle({ short: { ttl: 60_000, limit: 10 } }) // 10 login attempts/min per IP
  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(
    @Body()
    dto: Auth.LoginDto,
  ) {
    return this.authService.login(dto);
  }

  @Get('me')
  @UseGuards(AuthGuard)
  getMe(@CurrentUser() user: Auth.JwtPayload) {
    return user;
  }
}
