import { ApiProperty } from '@nestjs/swagger';
import {
  IsIBAN,
  IsPhoneNumber,
  IsString,
  IsUUID,
  IsOptional,
} from 'class-validator';

export class CreateSiteConfigDto {
  @ApiProperty({
    description: 'The name of the company for the site configuration',
    required: true,
  })
  @IsString()
  companyName: string;

  @ApiProperty({
    format: 'binary',
    description: 'The logo path for the site configuration',
    required: true,
  })
  logoPath: string;

  @ApiProperty({
    description: 'The email address for the site configuration',
    required: true,
  })
  @IsString()
  email: string;

  @ApiProperty({
    description: 'The phone number for the site configuration',
    required: true,
  })
  @IsPhoneNumber()
  phoneNumber: string;
  @ApiProperty({
    description: 'The IBAN for the site configuration',
    required: true,
  })
  @IsIBAN()
  iban: string;
  @ApiProperty({
    description: 'The company number for the site configuration',
    required: true,
  })
  @IsString()
  companyNumber: string;

  @ApiProperty({
    description: 'The address ID for the site configuration',
    required: true,
  })
  @IsUUID()
  addressId: string;
}
