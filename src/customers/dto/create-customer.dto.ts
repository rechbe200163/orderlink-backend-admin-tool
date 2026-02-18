import { BusinessSector } from 'generated/prisma/client';
import { ApiProperty, getSchemaPath } from '@nestjs/swagger';
import {
  IsEmail,
  IsOptional,
  IsPhoneNumber,
  IsString,
  isUUID,
  IsUUID,
  IsStrongPassword,
  MinLength,
} from 'class-validator';

export class CreateCustomerDto {
  @ApiProperty({
    type: String,
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    type: String,
  })
  @IsPhoneNumber()
  phoneNumber: string;

  @ApiProperty({
    type: String,
    description:
      'Password must be at least 8 characters long and contain uppercase, lowercase, number, and special character',
  })
  @IsStrongPassword(
    {
      minLength: 8,
      minLowercase: 1,
      minUppercase: 1,
      minNumbers: 1,
      minSymbols: 1,
    },
    {
      message:
        'Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, one number, and one special character',
    },
  )
  password: string;

  @ApiProperty({
    type: String,
    required: false,
  })
  @IsOptional()
  @IsString()
  firstName: string | null;

  @ApiProperty({
    type: String,
  })
  @IsString()
  lastName: string;

  @ApiProperty({
    type: String,
    default: '123456789',
    required: false,
  })
  @IsOptional()
  @IsString()
  companyNumber?: string | null;

  @IsOptional()
  avatarPath?: string | null;

  @ApiProperty({
    default: BusinessSector.IT,
    enum: BusinessSector,
    required: false,
  })
  @IsOptional()
  businessSector?: BusinessSector | null;

  @ApiProperty({
    type: String,
    required: true,
  })
  @IsUUID()
  addressId?: string | null;
}
