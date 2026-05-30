import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { UsersService } from './users.service';
import { PrismaService } from '../../prisma/prisma.service';

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
  passwordHash: 'hashed',
  isVerified: false,
  createdAt: new Date(),
  updatedAt: new Date(),
};

describe('UsersService', () => {
  let service: UsersService;
  let prismaService: jest.Mocked<PrismaService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: PrismaService,
          useValue: {
            user: {
              findUnique: jest.fn(),
              update: jest.fn(),
            },
          },
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    prismaService = module.get(PrismaService);
  });

  describe('findById', () => {
    it('should return user without passwordHash', async () => {
      (prismaService.user.findUnique as jest.Mock).mockResolvedValue(mockUser);

      const result = await service.findById('test-uuid');

      expect(result).not.toHaveProperty('passwordHash');
      expect(result.email).toBe(mockUser.email);
    });

    it('should throw NotFoundException if user not found', async () => {
      (prismaService.user.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(service.findById('nonexistent')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('emailExists', () => {
    it('should return true if email exists', async () => {
      (prismaService.user.findUnique as jest.Mock).mockResolvedValue(mockUser);
      const result = await service.emailExists('john@example.com');
      expect(result).toBe(true);
    });

    it('should return false if email does not exist', async () => {
      (prismaService.user.findUnique as jest.Mock).mockResolvedValue(null);
      const result = await service.emailExists('notfound@example.com');
      expect(result).toBe(false);
    });
  });
});
