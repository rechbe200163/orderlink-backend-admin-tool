import { Expose, Type } from 'class-transformer';
import { IsEmail, IsString, IsUUID } from 'class-validator';
import { RoleEntity } from 'src/roles/entities/role.entity';

export class EmployeesDto {
  @IsUUID()
  @Expose()
  employeeId: string;

  @IsEmail()
  @Expose()
  email: string;

  @IsString()
  @Expose()
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
  superAdmin: boolean;

  @Expose()
  @IsUUID()
  roleId: string;

  @Expose()
  @Type(() => RoleEntity)
  role?: {
    name: string;
  };
}
