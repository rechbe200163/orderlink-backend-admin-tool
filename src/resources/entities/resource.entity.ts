import { Expose } from 'class-transformer';

export class ResourceEntity {
  @Expose()
  id: string;
  @Expose()
  key: string;
  @Expose()
  description: string;
  @Expose()
  deleted: boolean;
}
