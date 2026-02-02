import { Injectable, NotFoundException } from '@nestjs/common';
import { SiteConfigRepository } from './site-config.repository';
import { FileRepositoryService } from 'src/file-repository/file-repository.service';
import { CreateSiteConfigDto } from 'prisma/src/generated/dto/create-siteConfig.dto';
import { SiteConfigDto } from 'prisma/src/generated/dto/siteConfig.dto';
import { UpdateSiteConfigDto } from 'prisma/src/generated/dto/update-siteConfig.dto';

@Injectable()
export class SiteConfigService {
  constructor(
    private readonly siteConfigRepository: SiteConfigRepository,
    private readonly fileService: FileRepositoryService,
  ) {}

  async create(
    createDto: CreateSiteConfigDto,
    file?: Express.Multer.File,
  ): Promise<SiteConfigDto> {
    if (file) {
      const filename = await this.fileService.uploadFile(file);
      createDto.logoPath = filename;
    }
    return this.siteConfigRepository.create(createDto);
  }

  async findFirst(): Promise<SiteConfigDto> {
    const siteConfig = await this.siteConfigRepository.findFirst();
    if (!siteConfig) {
      throw new NotFoundException('Site configuration not found');
    }
    if (siteConfig && siteConfig.logoPath) {
      siteConfig.logoPath = this.addCdnImageUrl(siteConfig.logoPath)!;
    }
    return siteConfig;
  }

  async findById(id: string): Promise<SiteConfigDto> {
    const siteConfig = await this.siteConfigRepository.findById(id);
    if (!siteConfig) {
      throw new NotFoundException('Site configuration not found');
    }
    if (siteConfig && siteConfig.logoPath) {
      siteConfig.logoPath = this.addCdnImageUrl(siteConfig.logoPath)!;
    }
    return siteConfig;
  }

  async update(
    id: string,
    updateDto: UpdateSiteConfigDto,
    file?: Express.Multer.File,
  ): Promise<SiteConfigDto> {
    if (file) {
      const filename = await this.fileService.uploadFile(file);
      updateDto.logoPath = filename;
    }
    return this.siteConfigRepository.update(id, updateDto);
  }

  private addCdnImageUrl(productImage: string | null): string | undefined {
    if (!productImage) return;
    if (productImage.startsWith('http://') || productImage.startsWith('https://')) {
      return productImage;
    }
    return this.fileService.getPublicUrl(productImage, 'siteConfig');
  }
}
