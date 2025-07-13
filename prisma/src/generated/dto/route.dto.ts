import { Expose } from 'class-transformer';

export class RouteDto {
  @Expose()
  routeId: string;
  @Expose()
  name: string;
  @Expose()
  deleted: boolean;
}
