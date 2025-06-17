import { BusinessSector } from '@prisma/client';
import { ApiProperty, getSchemaPath } from '@nestjs/swagger';
import {
  IsEmail,
  IsInt,
  IsOptional,
  IsString,
  isUUID,
  IsUUID,
} from 'class-validator';

export class UpdateCustomerDto {
  @ApiProperty({
    type: String,
    required: false,
  })
  @IsEmail()
  @IsOptional()
  email: string;

  @ApiProperty({
    type: String,
    required: false,
  })
  @IsString()
  @IsOptional()
  phoneNumber: string;

  @ApiProperty({
    type: String,
    required: false,
  })
  @IsString()
  @IsOptional()
  firstName: string | null;

  @ApiProperty({
    type: String,
    required: true,
  })
  @IsString()
  @IsOptional()
  lastName: string;

  @ApiProperty({
    type: String,
    default: '123456789',
    required: false,
  })
  @IsString()
  @IsOptional()
  companyNumber?: string | null;

  @IsOptional()
  avatarPath?: string | null;

  @ApiProperty({
    enum: BusinessSector,
    required: false,
  })
  @IsOptional()
  businessSector?: BusinessSector | null;

  @ApiProperty({
    type: String,
    required: false,
  })
  @IsUUID()
  @IsOptional()
  addressId?: string | undefined;
}
