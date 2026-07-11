import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { SecurityCenterService } from './security-center.service';
import * as jwt from 'jsonwebtoken';
import { JwtPayload } from '@devforge/auth';

@Injectable()
export class SecurityMiddleware implements NestMiddleware {
  constructor(private readonly security: SecurityCenterService) {}

  use(req: Request, res: Response, next: NextFunction) {
    const ip =
      (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() ||
      req.socket.remoteAddress ||
      'unknown';

    // 🛡️ Banned IP Shield - Block requests immediately!
    if (this.security.isIpBanned(ip)) {
      res.status(403).json({
        statusCode: 403,
        message: 'Your IP has been flagged and banned by DevForge Security Shield.',
        ip,
        error: 'Forbidden',
      });
      return;
    }

    const start = Date.now();

    // Extract user from token if present (best-effort, no throw)
    let userId: string | undefined;
    let userEmail: string | undefined;
    const auth = req.headers.authorization;
    if (auth?.startsWith('Bearer ')) {
      try {
        const decoded = jwt.decode(auth.slice(7)) as JwtPayload | null;
        if (decoded) {
          userId = decoded.userId;
          userEmail = decoded.email;
        }
      } catch {
        // ignore
      }
    }

    res.on('finish', () => {
      this.security.recordRequest({
        timestamp: Date.now(),
        ip,
        method: req.method,
        path: req.originalUrl,
        statusCode: res.statusCode,
        durationMs: Date.now() - start,
        userId,
        userEmail,
      });
    });

    next();
  }
}
