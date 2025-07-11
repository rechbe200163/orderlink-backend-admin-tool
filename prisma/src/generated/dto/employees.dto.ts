import { Exclude, Expose } from 'class-transformer';
import { IsEmail, IsString, IsUUID } from 'class-validator';

export class EmployeesDto {
  @IsUUID()
  @Expose()
  employeeId: string;

  @IsEmail()
  @Expose()
  email: string;

  @IsString()
  @Exclude()
  password: string;

  @IsString()
  @Expose()
  firstName: string;

  @IsString()
  @Expose()
  lastName: string;

  @IsString()
  @Expose()
  deleted: boolean;

  @Expose()
  @IsString()
  role: string;
}
