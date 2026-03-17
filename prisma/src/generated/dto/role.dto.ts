import { Expose } from 'class-transformer';

export class RoleDto {
  @Expose()
  roleId: string;
  @Expose()
  name: string;
  @Expose()
  description: string | null;
  @Expose()
  deleted: boolean;
}
