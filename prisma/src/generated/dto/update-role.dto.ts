import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, Matches } from 'class-validator';

export class UpdateRoleDto {
  @IsString()
  @ApiProperty({
    type: String,
    description: 'The name of the role',
    example: 'ADMIN',
    required: false,
  })
  @Matches(/^[A-Z_]+$/, {
    message:
      'Role must be in uppercase and can only contain letters and underscores',
  })
  @IsOptional()
  name?: string;

  @IsString()
  @ApiProperty({
    type: String,
    example: 'Administrator role with full access',
    required: false,
  })
  @IsOptional()
  description?: string;
}
