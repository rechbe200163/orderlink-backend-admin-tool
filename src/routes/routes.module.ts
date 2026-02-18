import { Module } from '@nestjs/common';
import { RoutesService } from './routes.service';
import { RoutesController } from './routes.controller';
import { RoutesRepository } from './routes.repository';
import { PrismaService } from 'src/prisma.service';
@Module({
  controllers: [RoutesController],
  providers: [RoutesService, RoutesRepository, PrismaService],
})
export class RoutesModule {}
