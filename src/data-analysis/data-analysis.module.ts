import { Module } from '@nestjs/common';
import { DataAnalysisService } from './data-analysis.service';
import { DataAnalysisController } from './data-analysis.controller';
import { PRISMA_CLIENT } from 'lib/providers/prisma-client.provider';
import { DataAnalysisTokenServiceService } from './external-api.token-service';
import { EmployeesModule } from 'src/employees/employees.module';
import { DatabaseModule } from 'src/database/database.module';

@Module({
  imports: [EmployeesModule, DatabaseModule],
  controllers: [DataAnalysisController],
  providers: [DataAnalysisService, DataAnalysisTokenServiceService],
})
export class DataAnalysisModule {}
