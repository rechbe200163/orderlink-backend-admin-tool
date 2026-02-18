import { Module } from '@nestjs/common';
import { ActionsService } from './actions.service';
import { ActionsController } from './actions.controller';
import { ActionsRepository } from './actions.repository';
import { PrismaService } from 'src/prisma.service';

@Module({
  controllers: [ActionsController],
  providers: [ActionsService, ActionsRepository, PrismaService],
  exports: [ActionsService, ActionsRepository],
})
export class ActionsModule {}
