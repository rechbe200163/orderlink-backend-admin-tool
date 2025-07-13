import { Expose } from 'class-transformer';

export class AddressDto {
  @Expose()
  addressId: string;
  @Expose()
  city: string;
  @Expose()
  country: string;
  @Expose()
  postCode: string;
  @Expose()
  state: string;
  @Expose()
  streetName: string;
  @Expose()
  streetNumber: string;
  @Expose()
  modifiedAt: Date | null;
  @Expose()
  deleted: boolean;
}
