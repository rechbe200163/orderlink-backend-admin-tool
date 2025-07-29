import { ApiProperty } from '@nestjs/swagger';
import { IsOptional } from 'class-validator';

export class UpdateSiteConfigDto {
  @ApiProperty({
    description: 'The name of the company for the site configuration',
    required: false,
  })
  @IsOptional()
  companyName?: string;

  @ApiProperty({
    description: 'The logo path for the site configuration',
    required: false,
  })
  @IsOptional()
  logoPath?: string;

  @ApiProperty({
    description: 'The name of the company for the site configuration',
    required: false,
  })
  @IsOptional()
  email?: string;

  @ApiProperty({
    description: 'The name of the company for the site configuration',
    required: false,
  })
  @IsOptional()
  phoneNumber?: string;

  @ApiProperty({
    description: 'The IBAN for the site configuration',
    required: false,
  })
  @IsOptional()
  iban?: string;

  @ApiProperty({
    description: 'The company number for the site configuration',
    required: false,
  })
  @IsOptional()
  companyNumber?: string;
}
