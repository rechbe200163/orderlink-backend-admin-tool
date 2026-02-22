import { Module } from '@nestjs/common';
import { DataAnalysisService } from './data-analysis.service';
import { DataAnalysisController } from './data-analysis.controller';
import { PrismaService } from 'src/prisma.service';
import { DataAnalysisTokenServiceService } from './external-api.token-service';
import { EmployeesModule } from 'src/employees/employees.module';

@Module({
  imports: [EmployeesModule],
  controllers: [DataAnalysisController],
  providers: [
    DataAnalysisService,
    PrismaService,
    DataAnalysisTokenServiceService,
  ],
})
export class DataAnalysisModule {}
