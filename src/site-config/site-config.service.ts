import { Injectable, NotFoundException } from '@nestjs/common';
import { SiteConfigRepository } from './site-config.repository';
import { UpdateSiteConfigDto } from 'prisma/src/generated/dto/update-siteConfig.dto';
import { SiteConfigDto } from 'prisma/src/generated/dto/siteConfig.dto';
import {
  FileRepositoryService,
  StorageBucket,
} from 'src/file-repository/file-repository.service';
import { CreateSiteConfigDto } from './dto/create-siteConfig.dto';

const SITE_CONFIG_BUCKET: StorageBucket = 'siteConfig';

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
      const filename = await this.fileService.uploadFile(
        tenantId,
        file,
        SITE_CONFIG_BUCKET,
      );
      createDto.logoPath = filename;
    }
    const siteConfig = await this.siteConfigRepository.create(
      tenantId,
      createDto,
    );
    return this.appendSignedLogo(siteConfig);
  }

  async findFirst(_tenantId: string): Promise<SiteConfigDto> {
    const siteConfig = await this.siteConfigRepository.findFirst();
    if (!siteConfig) {
      throw new NotFoundException('Site configuration not found');
    }
    return this.appendSignedLogo(siteConfig);
  }

  async findById(tenantId: string, id: string): Promise<SiteConfigDto> {
    const siteConfig = await this.siteConfigRepository.findById(tenantId, id);
    if (!siteConfig) {
      throw new NotFoundException('Site configuration not found');
    }
    return this.appendSignedLogo(siteConfig);
  }

  async update(
    tenantId: string,
    id: string,
    updateDto: UpdateSiteConfigDto,
    file?: Express.Multer.File,
  ): Promise<SiteConfigDto> {
    if (file) {
      const filename = await this.fileService.uploadFile(
        tenantId,
        file,
        SITE_CONFIG_BUCKET,
      );
      updateDto.logoPath = filename;
    }
    const siteConfig = await this.siteConfigRepository.update(
      tenantId,
      id,
      updateDto,
    );
    return this.appendSignedLogo(siteConfig);
  }

  private async appendSignedLogo<T extends { logoPath?: string | null }>(
    siteConfig: T,
  ): Promise<T> {
    if (!siteConfig?.logoPath) {
      return siteConfig;
    }

    const signedUrl = await this.fileService.getSignedUrl(
      SITE_CONFIG_BUCKET,
      siteConfig.logoPath,
    );

    return {
      ...siteConfig,
      logoPath: signedUrl ?? siteConfig.logoPath,
    };
  }
}

