import { SiteConfig } from './../../prisma/src/generated/dto/siteConfig.entity';
import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CustomPrismaService } from 'nestjs-prisma';
import { ExtendedPrismaClient } from 'prisma/prisma.extension';
import { CreateSiteConfigDto } from 'prisma/src/generated/dto/create-siteConfig.dto';
import { SiteConfigDto } from 'prisma/src/generated/dto/siteConfig.dto';
import { UpdateSiteConfigDto } from 'prisma/src/generated/dto/update-siteConfig.dto';
import { PagingResultDto } from 'lib/dto/genericPagingResultDto';
import { transformResponse } from 'lib/utils/transform';
import { isNoChange } from 'lib/utils/isNoChange';
import { Tenant } from 'src/tenants/entities/tenant.entity';
import { TenantsService } from 'src/tenants/tenants.service';

@Injectable()
export class SiteConfigRepository {
  constructor(
    @Inject('PrismaService')
    private readonly prismaService: CustomPrismaService<ExtendedPrismaClient>,
    private readonly tenantService: TenantsService,
  ) {}

  async create(data: CreateSiteConfigDto): Promise<SiteConfigDto> {
    const siteConfig = await this.prismaService.client.siteConfig.create({
      data,
    });
    this.tenantService.create({
      companyName: siteConfig.companyName,
      slug: encodeURIComponent(
        siteConfig.companyName.toLowerCase().replace(/\s+/g, '-'),
      ),
    });
    return transformResponse(SiteConfigDto, siteConfig);
  }

  async findFirst(): Promise<SiteConfigDto> {
    const siteConfig = await this.prismaService.client.siteConfig.findFirst({
      where: { deleted: false },
      include: {
        address: true, // Include address if needed
      },
    });
    return transformResponse(SiteConfigDto, siteConfig);
  }

  async findById(siteConfigId: string): Promise<SiteConfigDto> {
    const config = await this.prismaService.client.siteConfig.findUnique({
      where: { siteConfigId },
    });
    if (!config) {
      throw new NotFoundException(
        `SiteConfig with ID ${siteConfigId} not found`,
      );
    }
    return transformResponse(SiteConfigDto, config);
  }

  async update(
    siteConfigId: string,
    data: UpdateSiteConfigDto,
  ): Promise<SiteConfigDto> {
    const existing = await this.prismaService.client.siteConfig.findUnique({
      where: { siteConfigId },
    });
    if (!existing) {
      throw new NotFoundException(
        `SiteConfig with ID ${siteConfigId} not found`,
      );
    }
    if (isNoChange<UpdateSiteConfigDto>(data, existing)) {
      throw new BadRequestException(
        `No changes detected for site config ${siteConfigId}`,
      );
    }
    const config = await this.prismaService.client.siteConfig.update({
      where: { siteConfigId },
      data,
    });
    return transformResponse(SiteConfigDto, config);
  }
}
