
import {ApiProperty} from '@nestjs/swagger'
import {Address} from './address.entity'


export class SiteConfig {
  siteConfigId: string ;
companyName: string ;
logoPath: string ;
email: string ;
phoneNumber: string ;
iban: string ;
companyNumber: string ;
addressId: string ;
@ApiProperty({
  type: `string`,
  format: `date-time`,
})
modifiedAt: Date  | null;
isPremium: boolean ;
deleted: boolean ;
stripeCustomerId: string  | null;
stripeAccountId: string  | null;
stripeConfigured: boolean ;
address?: Address ;
}
