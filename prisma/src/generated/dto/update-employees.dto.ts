import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsEmail, IsOptional, IsString } from 'class-validator';

export class UpdateEmployeesDto {
  @ApiProperty({
    type: String,
    required: false,
  })
  @IsEmail()
  @IsOptional()
  email?: string;
  @ApiProperty({
    type: String,
    required: false,
  })
  @IsOptional()
  @IsString()
  password?: string;
  @ApiProperty({
    type: String,
    required: false,
  })
  @IsOptional()
  @IsString()
  firstName?: string;
  @ApiProperty({
    type: String,
    required: false,
  })
  @IsOptional()
  @IsString()
  lastName?: string;
  @ApiProperty({
    type: String,
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  superAdmin?: boolean;
}
