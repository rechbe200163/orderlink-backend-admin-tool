import { Module } from '@nestjs/common';
import { OnboardingsService } from './onboardings.service';
import { OnboardingsController } from './onboardings.controller';
import { TypedEventEmitterModule } from 'src/event-emitter/event-emitter.module';
import { EmployeesRepository } from 'src/employees/employees.repository';
import { EmployeesModule } from 'src/employees/employees.module';

@Module({
  imports: [TypedEventEmitterModule],
  controllers: [OnboardingsController],
  providers: [OnboardingsService],
})
export class OnboardingsModule {}
