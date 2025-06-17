import { ApiProperty } from '@nestjs/swagger';
import { Exclude, Expose } from 'class-transformer';
import { IsEmail, IsString, Matches } from 'class-validator';
import { RoleDto } from './role.dto';
import { CreateRoleDto } from './create-role.dto';

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
  @Matches(/^[A-Z_]+$/, {
    message:
      'Role must be in uppercase and can only contain letters and underscores',
  })
  @IsString()
  role: string;
}
