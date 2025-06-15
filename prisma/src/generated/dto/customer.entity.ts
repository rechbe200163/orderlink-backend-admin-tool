import { BusinessSector } from '@prisma/client';
import { ApiProperty } from '@nestjs/swagger';
import { Address } from './address.entity';
import { Cart } from './cart.entity';
import { Order } from './order.entity';
import { CustomerHistory } from './customerHistory.entity';
import { Exclude, Expose } from 'class-transformer';

export class CustomerEntity {
  @Exclude()
  customerId: string;
  @Expose()
  customerReference: number;
  @Expose()
  email: string;
  @Expose()
  phoneNumber: string;
  @Exclude()
  password: string;
  @Expose()
  firstName: string | null;
  lastName: string;
  @Expose()
  companyNumber: string | null;
  @Expose()
  modifiedAt: Date | null;
  @Expose()
  deleted: boolean;
  @Expose()
  signedUp: Date;
  @Expose()
  avatarPath: string | null;
  @Expose()
  addressId: string;
  @Expose()
  businessSector: BusinessSector | null;
  address?: Address;
  cart?: Cart | null;
  orders?: Order[];
  history?: CustomerHistory[];
}
