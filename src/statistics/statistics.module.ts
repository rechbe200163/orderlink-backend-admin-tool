import { Module } from '@nestjs/common';
import { StatisticsController } from './statistics.controller';
import { StatisticsService } from './statistics.service';
import { StatisticsRepository } from './statistics.repository';
import { PrismaService } from 'src/prisma.service';
@Module({
  controllers: [StatisticsController],
  providers: [StatisticsService, StatisticsRepository, PrismaService],
})
export class StatisticsModule {}
