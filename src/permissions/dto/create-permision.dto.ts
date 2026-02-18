import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsOptional, IsUUID } from 'class-validator';

export class CreatePermissionsDto {
  @ApiProperty({
    description: 'The unique key for the action',
    example: 'CREATE',
  })
  @IsUUID()
  roleId: string;
  @ApiProperty({
    description: 'A brief description of the action',
    example: 'This action allows users to create new resources.',
  })
  @IsUUID()
  resourceId: string;
  @ApiProperty({
    description: 'The unique key for the action',
    example: 'CREATE',
  })
  @IsUUID()
  actionId: string;
  @ApiProperty({
    description: 'The unique key for the action',
    example: 'CREATE',
  })
  @IsBoolean()
  @IsOptional()
  allowed?: boolean;
}
