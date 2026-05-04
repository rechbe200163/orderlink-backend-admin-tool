import { Module } from '@nestjs/common';
import { RouteOrdersService } from './route-orders.service';
import { RouteOrdersController } from './route-orders.controller';
import { DatabaseModule } from 'src/database/database.module';
import { RoutesOrdersRepository } from './routes-orders.repository';

@Module({
  imports : [DatabaseModule],
  controllers: [RouteOrdersController],
  providers: [RouteOrdersService, RoutesOrdersRepository],
})
export class RouteOrdersModule {}
