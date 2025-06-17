import { Exclude, Expose } from 'class-transformer';
import { IsBoolean, IsString, IsUUID } from 'class-validator';

export class CategoryDto {
  @Expose()
  @IsUUID()
  categoryId: string;
  @Expose()
  @IsString()
  name: string;
  @Exclude()
  @IsString()
  imagePath: string | null;
  @Expose()
  @IsBoolean()
  deleted: boolean;
}
