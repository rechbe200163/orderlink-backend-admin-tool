import { Injectable, NotFoundException } from '@nestjs/common';
import { SiteConfigRepository } from './site-config.repository';
import { CreateSiteConfigDto } from 'prisma/src/generated/dto/create-siteConfig.dto';
import { UpdateSiteConfigDto } from 'prisma/src/generated/dto/update-siteConfig.dto';
import { SiteConfigDto } from 'prisma/src/generated/dto/siteConfig.dto';
import { FileRepositoryService } from 'src/file-repository/file-repository.service';
import { Tenant } from 'src/tenants/entities/tenant.entity';
import { TenantDto } from 'src/tenants/dto/tenant-entity.dto';
import { TenantsService } from 'src/tenants/tenants.service';
import { MemoryStorageFile } from '@blazity/nest-file-fastify';

@Injectable()
export class SiteConfigService {
  constructor(
    private readonly siteConfigRepository: SiteConfigRepository,
    private readonly fileService: FileRepositoryService,
    private readonly tenantService: TenantsService,
  ) {}

  async create(
    createDto: CreateSiteConfigDto,
    file?: MemoryStorageFile,
  ): Promise<SiteConfigDto> {
    if (file) {
      const filename = await this.fileService.uploadFile(file);
      createDto.logoPath = filename;
    }
    return this.siteConfigRepository.create(createDto);
  }

  async findFirst(): Promise<{ siteConfig: SiteConfigDto; tenant: TenantDto }> {
    const siteConfig = await this.siteConfigRepository.findFirst();
    if (!siteConfig) {
      throw new NotFoundException('Site configuration not found');
    }
    const tenantInfo = await this.tenantService.getTenantById(
      siteConfig.tenantId,
    );
    if (!tenantInfo) {
      throw new NotFoundException('Tenant information not found');
    }
    if (siteConfig && siteConfig.logoPath) {
      siteConfig.logoPath = await this.fileService.getFile(siteConfig.logoPath);
    }
    return { siteConfig: siteConfig, tenant: tenantInfo };
  }

  async findById(id: string): Promise<SiteConfigDto> {
    const siteConfig = await this.siteConfigRepository.findById(id);
    if (!siteConfig) {
      throw new NotFoundException('Site configuration not found');
    }
    if (siteConfig && siteConfig.logoPath) {
      siteConfig.logoPath = await this.fileService.getFile(siteConfig.logoPath);
    }
    return siteConfig;
  }

  async update(
    id: string,
    updateDto: UpdateSiteConfigDto,
    file?: MemoryStorageFile,
  ): Promise<SiteConfigDto> {
    if (file) {
      const filename = await this.fileService.uploadFile(file);
      updateDto.logoPath = filename;
    }
    return this.siteConfigRepository.update(id, updateDto);
  }

  async getTenantInforamtion(): Promise<string> {
    const { tenantId } = await this.siteConfigRepository.findFirst();

    if (!tenantId) {
      throw new NotFoundException('Tenant information not found');
    }

    return tenantId;
  }
}
