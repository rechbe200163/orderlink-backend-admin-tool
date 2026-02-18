import { Module } from '@nestjs/common';
import { EmployeesService } from './employees.service';
import { EmployeesController } from './employees.controller';
import { EmployeesRepository } from './employees.repository';
import { RolesModule } from 'src/roles/roles.module';
import { TypedEventEmitterModule } from 'src/event-emitter/event-emitter.module';
import { PrismaService } from 'src/prisma.service';
@Module({
  imports: [RolesModule, TypedEventEmitterModule],
  controllers: [EmployeesController],
  providers: [EmployeesService, EmployeesRepository, PrismaService],
  exports: [EmployeesService, EmployeesRepository],
})
export class EmployeesModule {}
