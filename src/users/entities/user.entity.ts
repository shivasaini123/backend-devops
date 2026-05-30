import { ApiProperty } from '@nestjs/swagger';
import { Gender } from '@prisma/client';

export class UserEntity {
  @ApiProperty({ example: 'uuid-here' })
  id: string;

  @ApiProperty({ example: 'John Doe' })
  fullName: string;

  @ApiProperty({ example: 'john@example.com' })
  email: string;

  @ApiProperty({ example: '+1234567890' })
  phone: string;

  @ApiProperty({ example: '1990-01-01', required: false })
  dateOfBirth?: Date;

  @ApiProperty({ enum: Gender, required: false })
  gender?: Gender;

  @ApiProperty({ example: 'United States', required: false })
  country?: string;

  @ApiProperty({ example: 'California', required: false })
  state?: string;

  @ApiProperty({ example: 'Los Angeles', required: false })
  city?: string;

  @ApiProperty({ example: '90001', required: false })
  zipCode?: string;

  @ApiProperty({ example: false })
  isVerified: boolean;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}
