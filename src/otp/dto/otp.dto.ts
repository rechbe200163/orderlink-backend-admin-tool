import { Expose } from 'class-transformer';

export class OtpDto {
  @Expose()
  id: string;

  @Expose()
  code: string;

  @Expose()
  employeeId: string;

  @Expose()
  expiresAt: Date;

  @Expose()
  used: boolean;

  @Expose()
  createdAt: Date;
}
