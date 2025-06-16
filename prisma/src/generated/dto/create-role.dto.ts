import { ApiProperty } from '@nestjs/swagger';
import { IsString, Matches } from 'class-validator';

export class CreateRoleDto {
  @IsString()
  @ApiProperty({
    type: String,
    description: 'The name of the role',
    example: 'ADMIN',
  })
  @Matches(/^[A-Z_]+$/, {
    message:
      'Role must be in uppercase and can only contain letters and underscores',
  })
  name: string;
  @IsString()
  @ApiProperty({
    type: String,
    example: 'Administrator role with full access',
    required: false,
  })
  description?: string;
}
