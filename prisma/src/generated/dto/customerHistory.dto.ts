
import {BusinessSector} from '@prisma/client'
import {ApiProperty} from '@nestjs/swagger'


export class CustomerHistoryDto {
  historyId: string ;
email: string ;
phoneNumber: string ;
password: string ;
firstName: string  | null;
lastName: string ;
companyNumber: string  | null;
@ApiProperty({
  type: `string`,
  format: `date-time`,
})
modifiedAt: Date  | null;
deleted: boolean ;
@ApiProperty({
  type: `string`,
  format: `date-time`,
})
signedUp: Date ;
avatarPath: string  | null;
addressId: string ;
@ApiProperty({
  enum: BusinessSector,
})
businessSector: BusinessSector  | null;
}
