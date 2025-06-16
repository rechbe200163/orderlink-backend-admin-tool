import { ApiProperty } from '@nestjs/swagger';
import { Exclude, Expose } from 'class-transformer';
import { IsEmail, IsString, IsUUID } from 'class-validator';
import { RoleDto } from './role.dto';
import { Role } from './role.entity';

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
