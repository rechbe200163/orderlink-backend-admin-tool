import { Module } from '@nestjs/common';
import { InvoicesService } from './invoices.service';
import { InvoicesController } from './invoices.controller';
import { InvoicesRepository } from './invoices.repository';
import { ProductsModule } from 'src/products/products.module';
import { FileRepositoryModule } from 'src/file-repository/file-repository.module';
import { SiteConfigModule } from 'src/site-config/site-config.module';

@Module({
  imports: [ProductsModule, FileRepositoryModule, SiteConfigModule],
  controllers: [InvoicesController],
  providers: [InvoicesService, InvoicesRepository],
})
export class InvoicesModule {}
