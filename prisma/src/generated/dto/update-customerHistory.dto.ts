
import {BusinessSector} from '@prisma/client'
import {ApiProperty} from '@nestjs/swagger'




export class UpdateCustomerHistoryDto {
  email?: string;
phoneNumber?: string;
password?: string;
firstName?: string;
lastName?: string;
companyNumber?: string;
avatarPath?: string;
addressId?: string;
@ApiProperty({
  enum: BusinessSector,
})
businessSector?: BusinessSector;
}
