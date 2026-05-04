import { PartialType } from '@nestjs/swagger';
import { CreateRouteOrderDto } from './create-route-order.dto';

export class UpdateRouteOrderDto extends PartialType(CreateRouteOrderDto) {}
