import { ApiProperty } from '@nestjs/swagger';
import { Actions } from '@prisma/client';
import { Resources } from '../../../src/rbac/resources.enum';
import { Expose } from 'class-transformer';
import { IsBoolean, IsString, IsUUID, Matches } from 'class-validator';

export class PermissionDto {
  @ApiProperty({
    type: String,
    format: 'uuid',
    description: 'Unique identifier for the permission',
  })
  @IsUUID()
  @Expose()
  id: string;
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
  @Expose()
  role: string;

  @IsString()
  @ApiProperty({
    enum: Resources,
    description: 'The resource for which the permission is granted',
    example: 'CUSTOMER',
  })
  @Matches(/^[A-Z_]+$/, {
    message:
      'Resource must be in uppercase and can only contain letters and underscores',
  })
  @Expose()
  resource: Resources;

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
  @Expose()
  action: Actions;

  @ApiProperty({
    type: Boolean,
    description: 'Whether the permission is allowed or denied',
    example: true,
  })
  @IsBoolean()
  @Expose()
  allowed: boolean;
}
