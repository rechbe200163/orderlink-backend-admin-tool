import { BusinessSector } from '@prisma/client';
import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsInt, IsString } from 'class-validator';
import { Exclude, Expose } from 'class-transformer';

export class CustomerDto {
  @IsInt()
  @Expose()
  customerReference: number;

  @ApiProperty({
    type: String,
  })
  @IsEmail()
  @Expose()
  email: string;

  @ApiProperty({
    type: String,
  })
  @IsString()
  @Expose()
  phoneNumber: string;

  @ApiProperty({
    type: String,
  })
  @IsString()
  @Exclude()
  password: string;

  @ApiProperty({
    type: String,
    required: false,
  })
  @IsString()
  @Expose()
  firstName: string | null;

  @ApiProperty({
    type: String,
  })
  @IsString()
  @Expose()
  lastName: string;

  @ApiProperty({
    type: Number,
    required: false,
  })
  @IsString()
  @Expose()
  companyNumber: string | null;

  @ApiProperty({
    type: `string`,
    format: `date-time`,
  })
  @Exclude()
  modifiedAt: Date | null;

  @Expose()
  deleted: boolean;

  @ApiProperty({
    type: `string`,
    format: `date-time`,
  })
  @Expose()
  signedUp: Date;

  @Expose()
  avatarPath: string | null;

  @ApiProperty({
    enum: BusinessSector,
    required: false,
  })
  @Expose()
  businessSector: BusinessSector | null;
}
