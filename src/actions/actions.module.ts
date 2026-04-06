import { Module } from '@nestjs/common';
import { ActionsService } from './actions.service';
import { ActionsController } from './actions.controller';
import { ActionsRepository } from './actions.repository';
import { DatabaseModule } from 'src/database/database.module';

@Module({
  imports: [DatabaseModule],
  controllers: [ActionsController],
  providers: [ActionsService, ActionsRepository],
  exports: [ActionsService, ActionsRepository],
})
export class ActionsModule {}
