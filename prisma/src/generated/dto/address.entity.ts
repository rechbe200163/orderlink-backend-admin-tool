import { ApiProperty } from '@nestjs/swagger';
import { CustomerEntity } from './customer.entity';
import { SiteConfig } from './siteConfig.entity';

export class Address {
  addressId: string;
  city: string;
  country: string;
  postCode: string;
  state: string;
  streetName: string;
  streetNumber: string;
  @ApiProperty({
    type: `string`,
    format: `date-time`,
  })
  modifiedAt: Date | null;
  deleted: boolean;
  customers?: CustomerEntity[];
  siteConfig?: SiteConfig[];
}
