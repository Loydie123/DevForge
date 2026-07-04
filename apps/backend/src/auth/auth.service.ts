import {
  Injectable,
  ConflictException,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcryptjs';
import * as jwt from 'jsonwebtoken';
import {
  RegisterDto,
  LoginDto,
  JwtPayload,
  AuthResponse,
} from '@devforge/auth';

const MAX_FAILED = 5;
const LOCKOUT_MS = 15 * 60 * 1000; // 15 minutes

@Injectable()
export class AuthService {
  private readonly jwtSecret: string;
  private readonly failedAttempts = new Map<
    string,
    { count: number; lockedUntil: number }
  >();

  constructor(private prisma: PrismaService) {
    const secret = process.env.JWT_SECRET;
    if (!secret) throw new Error('JWT_SECRET env variable is not set');
    this.jwtSecret = secret;
  }

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
        role: 'developer', // Enforce default developer role for security
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

    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (!dto.password) throw new BadRequestException('Password is required.');

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

  validateToken(token: string): JwtPayload {
    try {
      const decoded = jwt.verify(token, this.jwtSecret) as JwtPayload;
      return decoded;
    } catch {
      throw new UnauthorizedException(
        'Invalid or expired authentication token.',
      );
    }
  }

  private generateToken(payload: JwtPayload): string {
    return jwt.sign(payload, this.jwtSecret, { expiresIn: '7d' });
  }
}
