import { Module } from '@nestjs/common';
import { EmployeesController } from './employee.controller';
import { EmployeesService } from './employee.service';

@Module({
  controllers: [EmployeesController],
  providers: [EmployeesService],
  exports: [EmployeesService],
})
export class EmployeesModule {}
