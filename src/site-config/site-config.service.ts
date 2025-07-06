import { Injectable } from '@nestjs/common';
import { SiteConfigRepository } from './site-config.repository';
import { CreateSiteConfigDto } from 'prisma/src/generated/dto/create-siteConfig.dto';
import { UpdateSiteConfigDto } from 'prisma/src/generated/dto/update-siteConfig.dto';
import { SiteConfigDto } from 'prisma/src/generated/dto/siteConfig.dto';
import { PagingResultDto } from 'lib/dto/genericPagingResultDto';

@Injectable()
export class SiteConfigService {
  constructor(private readonly siteConfigRepository: SiteConfigRepository) {}

  create(createDto: CreateSiteConfigDto): Promise<SiteConfigDto> {
    return this.siteConfigRepository.create(createDto);
  }

  findAll(limit = 10, page = 1): Promise<PagingResultDto<SiteConfigDto>> {
    return this.siteConfigRepository.findAll(limit, page);
  }

  findById(id: string): Promise<SiteConfigDto> {
    return this.siteConfigRepository.findById(id);
  }

  update(id: string, updateDto: UpdateSiteConfigDto): Promise<SiteConfigDto> {
    return this.siteConfigRepository.update(id, updateDto);
  }
}
