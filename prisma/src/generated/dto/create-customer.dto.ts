import { BusinessSector } from '@prisma/client';
import { ApiProperty, getSchemaPath } from '@nestjs/swagger';
import {
  IsEmail,
  IsOptional,
  IsPhoneNumber,
  IsString,
  isUUID,
  IsUUID,
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
  })
  @IsString()
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
