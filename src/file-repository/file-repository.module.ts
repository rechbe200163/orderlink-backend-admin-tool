import { Module } from '@nestjs/common';
import { FileRepositoryService } from './file-repository.service';
import { SupabaseStorageModule } from 'src/supabase-storage/supabase-storage.module';

@Module({
  imports: [SupabaseStorageModule],
  providers: [FileRepositoryService],
  exports: [FileRepositoryService],
})
export class FileRepositoryModule {}
