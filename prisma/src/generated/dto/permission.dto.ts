import { ApiProperty } from '@nestjs/swagger';
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
  permissionId: string;
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

  @IsUUID()
  @ApiProperty({
    description: 'The resource for which the permission is granted',
    example: 'CUSTOMER',
  })
  @Expose()
  resource: string;

  @IsUUID()
  @ApiProperty({
    description: 'The action for which the permission is granted',
    example: 'CREATE',
  })
  @Expose()
  action: string;

  @ApiProperty({
    type: Boolean,
    description: 'Whether the permission is allowed or denied',
    example: true,
  })
  @IsBoolean()
  @Expose()
  allowed: boolean;
}
