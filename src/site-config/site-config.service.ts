import { Injectable, NotFoundException } from '@nestjs/common';
import { SiteConfigRepository } from './site-config.repository';
import { UpdateSiteConfigDto } from 'prisma/src/generated/dto/update-siteConfig.dto';
import { SiteConfigDto } from 'prisma/src/generated/dto/siteConfig.dto';
import { FileRepositoryService } from 'src/file-repository/file-repository.service';
import { CreateSiteConfigDto } from './dto/create-siteConfig.dto';

@Injectable()
export class SiteConfigService {
  constructor(
    private readonly siteConfigRepository: SiteConfigRepository,
    private readonly fileService: FileRepositoryService,
  ) {}

  async create(
    tenantId: string,
    createDto: CreateSiteConfigDto,
    file?: Express.Multer.File,
  ): Promise<SiteConfigDto> {
    if (file) {
      const filename = await this.fileService.uploadFile(tenantId, file);
      createDto.logoPath = filename;
    }
    return this.siteConfigRepository.create(tenantId, createDto);
  }

  async findFirst(tenantId: string): Promise<SiteConfigDto> {
    const siteConfig = await this.siteConfigRepository.findFirst();
    if (!siteConfig) {
      throw new NotFoundException('Site configuration not found');
    }
    if (siteConfig && siteConfig.logoPath) {
      siteConfig.logoPath = this.addCdnImageUrl(siteConfig.logoPath)!;
    }
    return siteConfig;
  }

  async findById(tenantId: string, id: string): Promise<SiteConfigDto> {
    const siteConfig = await this.siteConfigRepository.findById(tenantId, id);
    if (!siteConfig) {
      throw new NotFoundException('Site configuration not found');
    }
    if (siteConfig && siteConfig.logoPath) {
      siteConfig.logoPath = this.addCdnImageUrl(siteConfig.logoPath)!;
    }
    return siteConfig;
  }

  async update(
    tenantId: string,
    id: string,
    updateDto: UpdateSiteConfigDto,
    file?: Express.Multer.File,
  ): Promise<SiteConfigDto> {
    if (file) {
      const filename = await this.fileService.uploadFile(tenantId, file);
      updateDto.logoPath = filename;
    }
    return this.siteConfigRepository.update(tenantId, id, updateDto);
  }

  private addCdnImageUrl(productImage: string | null): string | undefined {
    if (!productImage) return;

    const cdnUrl = `https://localhost/product-images/${productImage}`;
    return cdnUrl;
  }
}
