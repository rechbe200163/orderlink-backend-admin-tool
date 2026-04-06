import { Module } from '@nestjs/common';
import { EmployeesService } from './employees.service';
import { EmployeesController } from './employees.controller';
import { EmployeesRepository } from './employees.repository';
import { RolesModule } from 'src/roles/roles.module';
import { TypedEventEmitterModule } from 'src/event-emitter/event-emitter.module';
import { DatabaseModule } from 'src/database/database.module';
@Module({
  imports: [RolesModule, TypedEventEmitterModule, DatabaseModule],
  controllers: [EmployeesController],
  providers: [EmployeesService, EmployeesRepository],
  exports: [EmployeesService, EmployeesRepository],
})
export class EmployeesModule {}
