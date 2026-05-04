import { Expose } from 'class-transformer';
import { IsUUID } from 'class-validator';

export class RoutesOrdersDto {
  @Expose()
  @IsUUID()
  orderId: string;
}
