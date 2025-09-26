import { ApiProperty } from '@nestjs/swagger';
import { ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { CreateAddressDto } from 'prisma/src/generated/dto/create-address.dto';
import { CreateSiteConfigOnboardingDto } from './create-siteConfig-onboarding.dto';

export class CreateOnboardingDto {
  @ApiProperty({ type: CreateSiteConfigOnboardingDto })
  @ValidateNested()
  @Type(() => CreateSiteConfigOnboardingDto)
  siteConfig: CreateSiteConfigOnboardingDto;

  @ApiProperty({ type: CreateAddressDto })
  @ValidateNested()
  @Type(() => CreateAddressDto)
  address: CreateAddressDto;
}
