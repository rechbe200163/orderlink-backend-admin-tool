
import {ApiProperty} from '@nestjs/swagger'


export class SiteConfigDto {
  siteConfigId: string ;
companyName: string ;
logoPath: string ;
email: string ;
phoneNumber: string ;
iban: string ;
companyNumber: string ;
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
}
