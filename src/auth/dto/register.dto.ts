import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEmail,
  IsString,
  IsNotEmpty,
  MinLength,
  MaxLength,
  IsOptional,
  IsDateString,
  IsEnum,
  IsBoolean,
  Matches,
} from 'class-validator';
import { Gender } from '@prisma/client';

export class RegisterDto {
  // Personal Information
  @ApiProperty({ example: 'John Doe', description: 'Full name of the user' })
  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  @MaxLength(100)
  fullName: string;

  @ApiProperty({
    example: 'john@example.com',
    description: 'Email address (must be unique)',
  })
  @IsEmail({}, { message: 'Please provide a valid email address' })
  @IsNotEmpty()
  email: string;

  @ApiProperty({
    example: '+1234567890',
    description: 'Mobile phone number',
  })
  @IsString()
  @IsNotEmpty()
  @Matches(/^[+]?[(]?[0-9]{3}[)]?[-\s.]?[0-9]{3}[-\s.]?[0-9]{4,6}$/, {
    message: 'Please provide a valid phone number',
  })
  phone: string;

  @ApiPropertyOptional({
    example: '1990-01-15',
    description: 'Date of birth (ISO 8601)',
  })
  @IsOptional()
  @IsDateString()
  dateOfBirth?: string;

  @ApiPropertyOptional({
    enum: Gender,
    example: Gender.MALE,
    description: 'Gender',
  })
  @IsOptional()
  @IsEnum(Gender, { message: 'Gender must be MALE, FEMALE, or OTHER' })
  gender?: Gender;

  // Address Information
  @ApiPropertyOptional({ example: 'United States' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  country?: string;

  @ApiPropertyOptional({ example: 'California' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  state?: string;

  @ApiPropertyOptional({ example: 'Los Angeles' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  city?: string;

  @ApiPropertyOptional({ example: '90001' })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  zipCode?: string;

  // Account Information
  @ApiProperty({
    example: 'SecurePass123!',
    description: 'Password (min 8 chars, must include uppercase, lowercase, number, special char)',
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(8, { message: 'Password must be at least 8 characters long' })
  @Matches(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
    {
      message:
        'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character',
    },
  )
  password: string;

  @ApiProperty({
    example: 'SecurePass123!',
    description: 'Confirm password (must match password)',
  })
  @IsString()
  @IsNotEmpty()
  confirmPassword: string;

  @ApiProperty({ example: true, description: 'Accept terms and conditions' })
  @IsBoolean()
  acceptTerms: boolean;
}
