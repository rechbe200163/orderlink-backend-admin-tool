import { Module } from '@nestjs/common';
import { ResourcesService } from './resources.service';
import { ResourcesController } from './resources.controller';
import { ResourceRepository } from './resources.repository';
import { PrismaService } from 'src/prisma.service';

@Module({
  controllers: [ResourcesController],
  providers: [ResourcesService, ResourceRepository, PrismaService],
})
export class ResourcesModule {}
