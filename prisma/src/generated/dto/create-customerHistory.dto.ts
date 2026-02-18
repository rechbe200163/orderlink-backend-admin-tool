import { ApiProperty, getSchemaPath } from '@nestjs/swagger';
import { BusinessSector } from 'generated/prisma/client';

export class CreateCustomerHistoryDto {
  email: string;
  phoneNumber: string;
  password: string;
  firstName?: string;
  lastName: string;
  companyNumber?: string;
  avatarPath?: string;
  addressId: string;
  @ApiProperty({
    enum: BusinessSector,
  })
  businessSector?: BusinessSector;
}
