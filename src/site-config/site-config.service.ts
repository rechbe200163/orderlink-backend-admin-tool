import { Injectable, NotFoundException } from '@nestjs/common';
import { SiteConfigRepository } from './site-config.repository';
import { CreateSiteConfigDto } from 'prisma/src/generated/dto/create-siteConfig.dto';
import { UpdateSiteConfigDto } from 'prisma/src/generated/dto/update-siteConfig.dto';
import { SiteConfigDto } from 'prisma/src/generated/dto/siteConfig.dto';
import { FileRepositoryService } from 'src/file-repository/file-repository.service';

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

  findFirst(): Promise<SiteConfigDto> {
    const siteConfig = this.siteConfigRepository.findFirst();
    if (!siteConfig) {
      throw new NotFoundException('Site configuration not found');
    }
    const configPromise = siteConfig.then(async (config) => {
      if (config && config.logoPath) {
        config.logoPath = await this.fileService.getFile(config.logoPath);
      }
      return config;
    });
    return configPromise;
  }

  findById(id: string): Promise<SiteConfigDto> {
    const siteConfig = this.siteConfigRepository.findById(id);
    if (!siteConfig) {
      throw new NotFoundException('Site configuration not found');
    }
    const configPromise = siteConfig.then(async (config) => {
      if (config && config.logoPath) {
        config.logoPath = await this.fileService.getFile(config.logoPath);
      }
      return config;
    });
    return configPromise;
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
}
