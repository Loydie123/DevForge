import { Test, TestingModule } from '@nestjs/testing';
import {
  ConflictException,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { AuthService } from './auth.service';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcryptjs';

// ── Mocks ──────────────────────────────────────────────────────────────────────

const mockPrisma = {
  user: {
    findUnique: jest.fn(),
    create: jest.fn(),
  },
};

const mockCache = {
  get: jest.fn(),
  set: jest.fn(),
};

// ── Setup ──────────────────────────────────────────────────────────────────────

describe('AuthService', () => {
  let service: AuthService;

  beforeAll(() => {
    process.env.JWT_SECRET = 'test-secret-for-unit-tests';
  });

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: CACHE_MANAGER, useValue: mockCache },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    jest.clearAllMocks();
  });

  // ── register ────────────────────────────────────────────────────────────────

  describe('register()', () => {
    it('should throw if email is missing', async () => {
      await expect(
        service.register({ email: '', password: 'password123' }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw if password is shorter than 8 chars', async () => {
      await expect(
        service.register({ email: 'test@test.com', password: 'short' }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw ConflictException if email already exists', async () => {
      mockPrisma.user.findUnique.mockResolvedValue({
        id: '1',
        email: 'taken@test.com',
      });
      await expect(
        service.register({ email: 'taken@test.com', password: 'password123' }),
      ).rejects.toThrow(ConflictException);
    });

    it('should create user and return token on success', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null);
      mockPrisma.user.create.mockResolvedValue({
        id: 'abc-123',
        email: 'new@test.com',
        name: null,
        role: 'developer',
        password: 'hashed',
      });

      const result = await service.register({
        email: 'new@test.com',
        password: 'password123',
      });

      expect(result.token).toBeDefined();
      expect(result.user.email).toBe('new@test.com');
      expect(result.user.role).toBe('developer');
    });

    it('should always set role to developer (not admin)', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null);
      mockPrisma.user.create.mockResolvedValue({
        id: 'abc-123',
        email: 'hacker@test.com',
        name: null,
        role: 'developer',
        password: 'hashed',
      });

      await service.register({
        email: 'hacker@test.com',
        password: 'password123',
        role: 'admin',
      });

      const createCall = mockPrisma.user.create.mock.calls[0][0];
      expect(createCall.data.role).toBe('developer');
    });
  });

  // ── login ───────────────────────────────────────────────────────────────────

  describe('login()', () => {
    it('should throw if password is missing', async () => {
      await expect(service.login({ email: 'test@test.com' })).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw UnauthorizedException if user not found', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null);
      await expect(
        service.login({ email: 'nobody@test.com', password: 'password123' }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException if password is wrong', async () => {
      mockPrisma.user.findUnique.mockResolvedValue({
        id: '1',
        email: 'user@test.com',
        password: await bcrypt.hash('correctpassword', 10),
        role: 'developer',
        name: null,
      });

      await expect(
        service.login({ email: 'user@test.com', password: 'wrongpassword' }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should return token and user on valid credentials', async () => {
      const hashedPw = await bcrypt.hash('password123', 10);
      mockPrisma.user.findUnique.mockResolvedValue({
        id: 'user-1',
        email: 'admin@devforge.com',
        password: hashedPw,
        role: 'admin',
        name: 'Admin',
      });
      mockCache.get.mockResolvedValue(null); // not blacklisted

      const result = await service.login({
        email: 'admin@devforge.com',
        password: 'password123',
      });

      expect(result.token).toBeDefined();
      expect(result.user.email).toBe('admin@devforge.com');
    });

    it('should lock out after 5 failed attempts', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null);

      for (let i = 0; i < 5; i++) {
        try {
          await service.login(
            { email: 'x@x.com', password: 'wrong' },
            '1.2.3.4',
          );
        } catch {
          /* expected */
        }
      }

      await expect(
        service.login({ email: 'x@x.com', password: 'wrong' }, '1.2.3.4'),
      ).rejects.toThrow(/Try again in/);
    });
  });

  // ── validateToken ────────────────────────────────────────────────────────────

  describe('validateToken()', () => {
    it('should throw on invalid token', async () => {
      await expect(service.validateToken('not.a.token')).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should throw on blacklisted token', async () => {
      const hashedPw = await bcrypt.hash('password123', 10);
      mockPrisma.user.findUnique.mockResolvedValue({
        id: 'user-1',
        email: 'a@b.com',
        password: hashedPw,
        role: 'developer',
        name: null,
      });

      const { token } = await service.login({
        email: 'a@b.com',
        password: 'password123',
      });

      // Blacklist it
      mockCache.get.mockResolvedValue('1');

      await expect(service.validateToken(token)).rejects.toThrow(/revoked/);
    });

    it('should return payload on valid non-blacklisted token', async () => {
      const hashedPw = await bcrypt.hash('password123', 10);
      mockPrisma.user.findUnique.mockResolvedValue({
        id: 'user-1',
        email: 'a@b.com',
        password: hashedPw,
        role: 'developer',
        name: null,
      });
      mockCache.get.mockResolvedValue(null);

      const { token } = await service.login({
        email: 'a@b.com',
        password: 'password123',
      });
      const payload = await service.validateToken(token);

      expect(payload.email).toBe('a@b.com');
      expect(payload.role).toBe('developer');
    });
  });
});
