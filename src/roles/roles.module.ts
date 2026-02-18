import { Module } from '@nestjs/common';
import { RolesService } from './roles.service';
import { RolesController } from './roles.controller';
import { RolesRepository } from './roles.repository';
import { PrismaService } from 'src/prisma.service';

@Module({
  controllers: [RolesController],
  providers: [RolesService, RolesRepository, PrismaService],
  exports: [RolesService, RolesRepository],
})
export class RolesModule {}
