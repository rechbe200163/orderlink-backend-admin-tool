import { Exclude, Expose } from 'class-transformer';
import { IsBoolean, IsString, IsUUID } from 'class-validator';

export class RoleEntity {
  @Expose()
  @IsUUID()
  roleId: string;

  @Expose()
  @IsString()
  name: string;

  @Expose()
  @IsString()
  description: string;

  @Exclude()
  @IsBoolean()
  deleted: boolean;
}
