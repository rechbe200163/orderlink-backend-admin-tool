import { Module } from '@nestjs/common';
import { ResourcesService } from './resources.service';
import { ResourcesController } from './resources.controller';
import { ResourceRepository } from './resources.repository';
import { DatabaseModule } from 'src/database/database.module';

@Module({
  imports: [DatabaseModule],
  controllers: [ResourcesController],
  providers: [ResourcesService, ResourceRepository],
})
export class ResourcesModule {}
