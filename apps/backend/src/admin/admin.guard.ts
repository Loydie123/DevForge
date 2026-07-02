import {
  CanActivate,
  ExecutionContext,
  Injectable,
  ForbiddenException,
} from '@nestjs/common';
import { AuthService } from '../auth/auth.service';
import { Request } from 'express';
import { JwtPayload } from '@devforge/auth';

interface CustomRequest extends Request {
  user?: JwtPayload;
}

/**
 * Extends AuthGuard by also enforcing the "admin" role.
 * Apply after AuthGuard or as a standalone combined guard.
 */
@Injectable()
export class AdminGuard implements CanActivate {
  constructor(private readonly authService: AuthService) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<CustomRequest>();
    const authHeader = request.headers.authorization;

    if (!authHeader) {
      throw new ForbiddenException('Authorization header is missing.');
    }

    const [scheme, token] = authHeader.split(' ');
    if (scheme !== 'Bearer' || !token) {
      throw new ForbiddenException('Invalid authorization header format.');
    }

    const payload = this.authService.validateToken(token);
    request.user = payload;

    if (payload.role !== 'admin') {
      throw new ForbiddenException(
        'Access denied: Administrator privileges required.',
      );
    }

    return true;
  }
}
