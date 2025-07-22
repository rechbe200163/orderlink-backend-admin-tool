import { Injectable } from '@nestjs/common';
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
    return this.siteConfigRepository.findFirst();
  }

  findById(id: string): Promise<SiteConfigDto> {
    return this.siteConfigRepository.findById(id);
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
