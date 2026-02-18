import { Module } from '@nestjs/common';
import { PermissionsService } from './permissions.service';
import { PermissionsController } from './permissions.controller';
import { PermissionsRepository } from './permissions.repository';
import { RolesModule } from 'src/roles/roles.module';
import { TypedEventEmitterModule } from 'src/event-emitter/event-emitter.module';
import { PrismaService } from 'src/prisma.service';
import { ActionsModule } from 'src/actions/actions.module';
@Module({
  imports: [RolesModule, ActionsModule, TypedEventEmitterModule],
  controllers: [PermissionsController],
  providers: [PermissionsService, PermissionsRepository, PrismaService],
  exports: [PermissionsService, PermissionsRepository],
})
export class PermissionsModule {}
