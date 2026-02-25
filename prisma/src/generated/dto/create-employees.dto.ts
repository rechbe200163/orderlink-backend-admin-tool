import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import { IsEmail, IsString, IsUUID } from 'class-validator';
import { RoleDto } from './role.dto';

export class CreateEmployeesDto {
  @ApiProperty({
    type: String,
    required: true,
  })
  @IsEmail()
  @Expose()
  email: string;

  @ApiProperty({
    type: String,
    required: true,
  })
  @IsString()
  @Expose()
  firstName: string;

  @ApiProperty({
    type: String,
    required: true,
  })
  @IsString()
  @Expose()
  lastName: string;

  @ApiProperty({
    type: RoleDto,
    required: true,
  })
  @Expose()
  @IsUUID()
  roleId: string;

  @ApiProperty({ required: false, default: false })
  @Expose()
  superAdmin?: boolean;
}
