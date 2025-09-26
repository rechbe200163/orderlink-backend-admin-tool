import { Expose } from 'class-transformer';
import { PermissionDto } from './permission.dto';
import { IsOptional } from 'class-validator';

export class RoleDto {
  @Expose()
  name: string;
  @Expose()
  description: string | null;
  @Expose()
  deleted: boolean;
  @Expose()
  permissions?: PermissionDto[];
}
