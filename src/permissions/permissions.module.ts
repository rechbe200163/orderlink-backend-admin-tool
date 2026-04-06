import { Module } from '@nestjs/common';
import { PermissionsService } from './permissions.service';
import { PermissionsController } from './permissions.controller';
import { PermissionsRepository } from './permissions.repository';
import { RolesModule } from 'src/roles/roles.module';
import { TypedEventEmitterModule } from 'src/event-emitter/event-emitter.module';
import { ActionsModule } from 'src/actions/actions.module';
import { DatabaseModule } from 'src/database/database.module';
@Module({
  imports: [
    RolesModule,
    ActionsModule,
    TypedEventEmitterModule,
    DatabaseModule,
  ],
  controllers: [PermissionsController],
  providers: [PermissionsService, PermissionsRepository],
  exports: [PermissionsService, PermissionsRepository],
})
export class PermissionsModule {}
