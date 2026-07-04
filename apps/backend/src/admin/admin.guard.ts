import {
  CanActivate,
  ExecutionContext,
  Injectable,
  ForbiddenException,
} from '@nestjs/common';
import { AuthService } from '../auth/auth.service';
import type { Request } from 'express';
import { JwtPayload } from '@devforge/auth';

interface CustomRequest extends Request {
  user?: JwtPayload;
}

@Injectable()
export class AdminGuard implements CanActivate {
  constructor(private readonly authService: AuthService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<CustomRequest>();
    const authHeader = request.headers.authorization;

    if (!authHeader) {
      throw new ForbiddenException('Authorization header is missing.');
    }

    const [scheme, token] = authHeader.split(' ');
    if (scheme !== 'Bearer' || !token) {
      throw new ForbiddenException('Invalid authorization header format.');
    }

    // validateToken now checks the blacklist — revoked tokens rejected here too
    const payload = await this.authService.validateToken(token);
    request.user = payload;

    if (payload.role !== 'admin') {
      throw new ForbiddenException(
        'Access denied: Administrator privileges required.',
      );
    }

    return true;
  }
}
