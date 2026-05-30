import {
  Injectable,
  ConflictException,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from '../../prisma/prisma.service';
import { UsersService } from '../../users/services/users.service';
import { RegisterDto } from '../dto/register.dto';
import { LoginDto } from '../dto/login.dto';
import { User } from '@prisma/client';

const SALT_ROUNDS = 12;

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async register(registerDto: RegisterDto): Promise<{
    user: Omit<User, 'passwordHash'>;
    accessToken: string;
  }> {
    const {
      password,
      confirmPassword,
      acceptTerms,
      email,
      dateOfBirth,
      ...rest
    } = registerDto;

    // Validate passwords match
    if (password !== confirmPassword) {
      throw new BadRequestException('Passwords do not match');
    }

    // Validate terms accepted
    if (!acceptTerms) {
      throw new BadRequestException('You must accept the terms and conditions');
    }

    // Check for duplicate email
    const emailExists = await this.usersService.emailExists(email);
    if (emailExists) {
      throw new ConflictException('An account with this email already exists');
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

    // Create user
    const user = await this.prisma.user.create({
      data: {
        ...rest,
        email: email.toLowerCase(),
        passwordHash,
        dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : null,
      },
    });

    // Generate JWT
    const accessToken = this.generateToken(user);

    const { passwordHash: _, ...userWithoutPassword } = user;
    return {
      user: userWithoutPassword,
      accessToken,
    };
  }

  async login(loginDto: LoginDto): Promise<{
    user: Omit<User, 'passwordHash'>;
    accessToken: string;
  }> {
    const { email, password } = loginDto;

    // Find user
    const user = await this.usersService.findByEmail(email);
    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid email or password');
    }

    // Generate JWT
    const accessToken = this.generateToken(user);

    const { passwordHash, ...userWithoutPassword } = user;
    return {
      user: userWithoutPassword,
      accessToken,
    };
  }

  private generateToken(user: User): string {
    const payload = { sub: user.id, email: user.email };
    return this.jwtService.sign(payload);
  }
}
