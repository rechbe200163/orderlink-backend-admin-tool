import { Module } from '@nestjs/common';
import { FileRepositoryService } from './file-repository.service';
import { MinioModule } from 'src/minio/minio.module';

@Module({
  imports: [MinioModule],
  providers: [FileRepositoryService],
  exports: [FileRepositoryService],
})
export class FileRepositoryModule {}
