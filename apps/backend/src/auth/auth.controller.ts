import {
  Controller,
  Post,
  Get,
  Body,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthGuard } from './auth.guard';
import { CurrentUser } from './current-user.decorator';
import * as Auth from '@devforge/auth';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  async register(
    @Body()
    dto: Auth.RegisterDto,
  ) {
    return this.authService.register(dto);
  }

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
