import { ApiProperty } from '@nestjs/swagger';
import { Actions, Ressources } from '@prisma/client';
import {
  IsBoolean,
  isBoolean,
  IsOptional,
  IsString,
  Matches,
} from 'class-validator';

export class CreatePermissionDto {
  @ApiProperty({
    type: String,
    description: 'The role associated with the permission',
    example: 'ADMIN',
  })
  @Matches(/^[A-Z_]+$/, {
    message:
      'Role must be in uppercase and can only contain letters and underscores',
  })
  @IsString()
  role: string;

  @IsString()
  @ApiProperty({
    enum: Ressources,
    description: 'The resource for which the permission is granted',
    example: 'CUSTOMER',
  })
  @Matches(/^[A-Z_]+$/, {
    message:
      'Resource must be in uppercase and can only contain letters and underscores',
  })
  resource: Ressources;

  @IsString()
  @ApiProperty({
    enum: Actions,
    description: 'The action for which the permission is granted',
    example: 'CREATE',
  })
  @Matches(/^[A-Z_]+$/, {
    message:
      'Action must be in uppercase and can only contain letters and underscores',
  })
  action: Actions;

  @ApiProperty({
    type: Boolean,
    description: 'Whether the permission is allowed or denied',
    example: true,
  })
  @IsBoolean()
  @IsOptional()
  allowed?: boolean;
}
