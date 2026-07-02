import {
  Injectable,
  ConflictException,
  UnauthorizedException,
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

@Injectable()
export class AuthService {
  private readonly jwtSecret =
    process.env.JWT_SECRET || 'devforge-super-secret-key-2026';

  constructor(private prisma: PrismaService) {}

  async register(dto: RegisterDto): Promise<AuthResponse> {
    const existing = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (existing) {
      throw new ConflictException(
        `Email "${dto.email}" is already registered.`,
      );
    }

    const passwordHash = await bcrypt.hash(dto.password || 'default123', 10);

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

  async login(dto: LoginDto): Promise<AuthResponse> {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials.');
    }

    const matches = await bcrypt.compare(dto.password || '', user.password);

    if (!matches) {
      throw new UnauthorizedException('Invalid credentials.');
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
