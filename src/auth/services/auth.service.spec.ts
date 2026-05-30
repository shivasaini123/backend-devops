import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcryptjs';
import { AuthService } from './auth.service';
import { PrismaService } from '../../prisma/prisma.service';
import { UsersService } from '../../users/services/users.service';

const mockUser = {
  id: 'test-uuid',
  fullName: 'John Doe',
  email: 'john@example.com',
  phone: '+1234567890',
  dateOfBirth: null,
  gender: null,
  country: null,
  state: null,
  city: null,
  zipCode: null,
  passwordHash: '$2b$12$hashedpassword',
  isVerified: false,
  createdAt: new Date(),
  updatedAt: new Date(),
};

describe('AuthService', () => {
  let service: AuthService;
  let prismaService: jest.Mocked<PrismaService>;
  let usersService: jest.Mocked<UsersService>;
  let jwtService: jest.Mocked<JwtService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: PrismaService,
          useValue: {
            user: {
              create: jest.fn(),
              findUnique: jest.fn(),
            },
          },
        },
        {
          provide: UsersService,
          useValue: {
            emailExists: jest.fn(),
            findByEmail: jest.fn(),
          },
        },
        {
          provide: JwtService,
          useValue: {
            sign: jest.fn().mockReturnValue('mock-jwt-token'),
          },
        },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn().mockReturnValue('test-secret'),
          },
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    prismaService = module.get(PrismaService);
    usersService = module.get(UsersService);
    jwtService = module.get(JwtService);
  });

  describe('register', () => {
    const registerDto = {
      fullName: 'John Doe',
      email: 'john@example.com',
      phone: '+1234567890',
      password: 'SecurePass123!',
      confirmPassword: 'SecurePass123!',
      acceptTerms: true,
    };

    it('should register a new user successfully', async () => {
      usersService.emailExists.mockResolvedValue(false);
      (prismaService.user.create as jest.Mock).mockResolvedValue(mockUser);

      const result = await service.register(registerDto);

      expect(result.accessToken).toBe('mock-jwt-token');
      expect(result.user.email).toBe(mockUser.email);
      expect(result.user).not.toHaveProperty('passwordHash');
    });

    it('should throw ConflictException if email already exists', async () => {
      usersService.emailExists.mockResolvedValue(true);

      await expect(service.register(registerDto)).rejects.toThrow(
        ConflictException,
      );
    });

    it('should throw BadRequestException if passwords do not match', async () => {
      await expect(
        service.register({ ...registerDto, confirmPassword: 'DifferentPass123!' }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException if terms not accepted', async () => {
      await expect(
        service.register({ ...registerDto, acceptTerms: false }),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('login', () => {
    it('should login successfully with valid credentials', async () => {
      usersService.findByEmail.mockResolvedValue(mockUser);
      jest.spyOn(bcrypt, 'compare').mockResolvedValue(true as never);

      const result = await service.login({
        email: 'john@example.com',
        password: 'SecurePass123!',
      });

      expect(result.accessToken).toBe('mock-jwt-token');
      expect(result.user).not.toHaveProperty('passwordHash');
    });

    it('should throw UnauthorizedException if user not found', async () => {
      usersService.findByEmail.mockResolvedValue(null);

      await expect(
        service.login({ email: 'notfound@example.com', password: 'pass' }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException if password is wrong', async () => {
      usersService.findByEmail.mockResolvedValue(mockUser);
      jest.spyOn(bcrypt, 'compare').mockResolvedValue(false as never);

      await expect(
        service.login({ email: 'john@example.com', password: 'WrongPass123!' }),
      ).rejects.toThrow(UnauthorizedException);
    });
  });
});
