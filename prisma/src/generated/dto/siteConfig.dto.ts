import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import { AddressDto } from './address.dto';

export class SiteConfigDto {
  @ApiProperty({
    description: 'The unique identifier for the site configuration',
    type: String,
    format: 'uuid',
  })
  @Expose()
  siteConfigId: string;
  @Expose()
  companyName: string;
  @Expose()
  logoPath: string;
  @Expose()
  email: string;
  @Expose()
  phoneNumber: string;
  @Expose()
  iban: string;
  @Expose()
  companyNumber: string;
  @ApiProperty({
    type: String,
    format: 'date-time',
  })
  @Expose({
    name: 'createdAt',
    toPlainOnly: true,
  })
  createdAt: Date | null;
  @Expose({
    name: 'modifiedAt',
    toPlainOnly: true,
  })
  modifiedAt: Date | null;
  @Expose()
  isPremium: boolean;
  @Expose()
  deleted: boolean;
  @Expose()
  stripeCustomerId: string | null;
  @Expose()
  stripeAccountId: string | null;
  @Expose()
  stripeConfigured: boolean;
  @Expose()
  address: AddressDto;
}
