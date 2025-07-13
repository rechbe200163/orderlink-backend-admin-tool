import { ApiProperty } from '@nestjs/swagger';
import { Actions, Ressources } from '@prisma/client';
import {
  ArrayNotEmpty,
  IsArray,
  IsBoolean,
  IsOptional,
  IsString,
  Matches,
} from 'class-validator';

export class CreatePermissionsDto {
  @ApiProperty({
    type: String,
    description: 'Role to which permissions will be assigned',
    example: 'EMPLOYEE',
  })
  @Matches(/^[A-Z_]+$/, {
    message:
      'Role must be in uppercase and can only contain letters and underscores',
  })
  @IsString()
  role: string;

  @ApiProperty({
    enum: Ressources,
    description: 'Resource for which permissions are granted',
    example: 'CUSTOMER',
  })
  @Matches(/^[A-Z_]+$/, {
    message:
      'Resource must be in uppercase and can only contain letters and underscores',
  })
  resource: Ressources;

  @ApiProperty({
    enum: Actions,
    isArray: true,
    description: 'Actions to grant for the resource',
    example: [Actions.READ, Actions.CREATE],
  })
  @IsArray()
  @ArrayNotEmpty()
  actions: Actions[];

  @ApiProperty({
    type: Boolean,
    description: 'Whether the permission is allowed or denied',
    example: true,
    required: false,
  })
  @IsBoolean()
  @IsOptional()
  allowed?: boolean;
}
