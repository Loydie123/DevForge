import {
  Injectable,
  ConflictException,
  UnauthorizedException,
  BadRequestException,
  Inject,
} from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { Cache } from 'cache-manager';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcryptjs';
import * as jwt from 'jsonwebtoken';
import { randomUUID } from 'crypto';
import {
  RegisterDto,
  LoginDto,
  JwtPayload,
  AuthResponse,
} from '@devforge/auth';

const MAX_FAILED = 5;
const LOCKOUT_MS = 15 * 60 * 1000; // 15 minutes
const TOKEN_TTL_SECONDS = 7 * 24 * 60 * 60; // 7 days (matches JWT expiresIn)
const BLACKLIST_PREFIX = 'jwt_blacklist:';

@Injectable()
export class AuthService {
  private readonly jwtSecret: string;
  private readonly failedAttempts = new Map<
    string,
    { count: number; lockedUntil: number }
  >();

  constructor(
    private prisma: PrismaService,
    @Inject(CACHE_MANAGER) private cache: Cache,
  ) {
    const secret = process.env.JWT_SECRET;
    if (!secret) throw new Error('JWT_SECRET env variable is not set');
    this.jwtSecret = secret;
  }

  // ── Lockout helpers ────────────────────────────────────────────────────────

  private checkLockout(ip: string): void {
    const entry = this.failedAttempts.get(ip);
    if (!entry) return;
    if (Date.now() < entry.lockedUntil) {
      const mins = Math.ceil((entry.lockedUntil - Date.now()) / 60_000);
      throw new UnauthorizedException(
        `Too many failed attempts. Try again in ${mins} minute(s).`,
      );
    }
  }

  private recordFailure(ip: string): void {
    const entry = this.failedAttempts.get(ip) ?? { count: 0, lockedUntil: 0 };
    entry.count += 1;
    if (entry.count >= MAX_FAILED) {
      entry.lockedUntil = Date.now() + LOCKOUT_MS;
      entry.count = 0;
    }
    this.failedAttempts.set(ip, entry);
  }

  private clearFailures(ip: string): void {
    this.failedAttempts.delete(ip);
  }

  // ── Blacklist helpers ──────────────────────────────────────────────────────

  async revokeToken(jti: string): Promise<void> {
    await this.cache.set(
      `${BLACKLIST_PREFIX}${jti}`,
      '1',
      TOKEN_TTL_SECONDS * 1000, // cache-manager uses milliseconds
    );
  }

  async isRevoked(jti: string): Promise<boolean> {
    const val = await this.cache.get(`${BLACKLIST_PREFIX}${jti}`);
    return val === '1';
  }

  // ── Auth ───────────────────────────────────────────────────────────────────

  async register(dto: RegisterDto): Promise<AuthResponse> {
    if (!dto.email || !dto.password) {
      throw new BadRequestException('Email and password are required.');
    }
    if (dto.password.length < 8) {
      throw new BadRequestException('Password must be at least 8 characters.');
    }

    const existing = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });
    if (existing) {
      throw new ConflictException(
        `Email "${dto.email}" is already registered.`,
      );
    }

    const passwordHash = await bcrypt.hash(dto.password, 10);
    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        password: passwordHash,
        name: dto.name,
        role: 'developer', // Enforce safe default
      },
    });

    const token = this.generateToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    return {
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    };
  }

  async login(dto: LoginDto, ip = 'unknown'): Promise<AuthResponse> {
    this.checkLockout(ip);

    if (!dto.password) throw new BadRequestException('Password is required.');

    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });
    if (!user) {
      this.recordFailure(ip);
      throw new UnauthorizedException('Invalid credentials.');
    }

    const matches = await bcrypt.compare(dto.password, user.password);
    if (!matches) {
      this.recordFailure(ip);
      throw new UnauthorizedException('Invalid credentials.');
    }

    this.clearFailures(ip);
    const token = this.generateToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    return {
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    };
  }

  async logout(token: string): Promise<void> {
    try {
      const decoded = jwt.verify(token, this.jwtSecret) as JwtPayload & {
        jti?: string;
      };
      if (decoded.jti) {
        await this.revokeToken(decoded.jti);
      }
    } catch {
      // Token already invalid — nothing to revoke
    }
  }

  async validateToken(token: string): Promise<JwtPayload> {
    let decoded: JwtPayload & { jti?: string };
    try {
      decoded = jwt.verify(token, this.jwtSecret) as JwtPayload & {
        jti?: string;
      };
    } catch {
      throw new UnauthorizedException(
        'Invalid or expired authentication token.',
      );
    }

    // Check blacklist — revoked tokens are rejected even if signature is valid
    if (decoded.jti && (await this.isRevoked(decoded.jti))) {
      throw new UnauthorizedException(
        'Token has been revoked. Please log in again.',
      );
    }

    return decoded;
  }

  private generateToken(payload: JwtPayload): string {
    return jwt.sign(
      { ...payload, jti: randomUUID() }, // unique ID per token for blacklisting
      this.jwtSecret,
      { expiresIn: '7d' },
    );
  }
}
