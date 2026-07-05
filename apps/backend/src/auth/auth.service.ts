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

interface GitHubUser {
  id: number;
  login: string;
  name: string | null;
  email: string | null;
  avatar_url: string;
}

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

    if (!user.password) {
      // OAuth-only account — no password set
      this.recordFailure(ip);
      throw new UnauthorizedException(
        'This account uses GitHub sign-in. Please click "Continue with GitHub" to log in.',
      );
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

  // ── GitHub OAuth ───────────────────────────────────────────────────────────

  getGitHubAuthUrl(): string {
    const clientId = process.env.GITHUB_CLIENT_ID;
    if (!clientId) throw new Error('GITHUB_CLIENT_ID is not set');
    const callbackUrl =
      process.env.GITHUB_CALLBACK_URL ??
      'http://localhost:4000/api/auth/github/callback';
    const params = new URLSearchParams({
      client_id: clientId,
      redirect_uri: callbackUrl,
      scope: 'user:email',
    });
    return `https://github.com/login/oauth/authorize?${params.toString()}`;
  }

  async loginWithGitHub(code: string): Promise<AuthResponse> {
    const clientId = process.env.GITHUB_CLIENT_ID;
    const clientSecret = process.env.GITHUB_CLIENT_SECRET;
    if (!clientId || !clientSecret) {
      throw new Error('GitHub OAuth credentials are not configured');
    }

    // 1. Exchange code for access token
    const tokenRes = await fetch(
      'https://github.com/login/oauth/access_token',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({
          client_id: clientId,
          client_secret: clientSecret,
          code,
        }),
      },
    );
    const tokenData = (await tokenRes.json()) as Record<string, string>;
    const accessToken = tokenData['access_token'];
    if (!accessToken) {
      throw new UnauthorizedException(
        'GitHub OAuth failed: could not get access token',
      );
    }

    // 2. Get user info from GitHub
    const userRes = await fetch('https://api.github.com/user', {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: 'application/json',
      },
    });
    const ghUser = (await userRes.json()) as GitHubUser;

    // 3. Get primary verified email if not public
    let email = ghUser.email;
    if (!email) {
      const emailsRes = await fetch('https://api.github.com/user/emails', {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          Accept: 'application/json',
        },
      });
      const emails = (await emailsRes.json()) as Array<{
        email: string;
        primary: boolean;
        verified: boolean;
      }>;
      email = emails.find((e) => e.primary && e.verified)?.email ?? null;
    }
    if (!email) {
      throw new BadRequestException(
        'Your GitHub account has no verified email. Please add a public email in GitHub settings.',
      );
    }

    // 4. Find or create user
    const githubId = String(ghUser.id);
    let user = await this.prisma.user.findFirst({
      where: { OR: [{ githubId }, { email }] },
    });

    if (user) {
      // Link GitHub if not already linked
      if (!user.githubId) {
        user = await this.prisma.user.update({
          where: { id: user.id },
          data: {
            githubId,
            avatarUrl: ghUser.avatar_url,
            name: user.name ?? ghUser.name,
          },
        });
      }
    } else {
      user = await this.prisma.user.create({
        data: {
          email,
          name: ghUser.name ?? ghUser.login,
          avatarUrl: ghUser.avatar_url,
          githubId,
          role: 'developer',
        },
      });
    }

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
