import { Module } from '@nestjs/common';
import { RoutesService } from './routes.service';
import { RoutesController } from './routes.controller';
import { RoutesRepository } from './routes.repository';
import { TenantsModule } from 'src/tenants/tenants.module';

@Module({
  imports: [TenantsModule],
  controllers: [RoutesController],
  providers: [RoutesService, RoutesRepository],
})
export class RoutesModule {}
