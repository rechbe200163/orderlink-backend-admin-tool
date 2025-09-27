import { SiteConfig } from './../../prisma/src/generated/dto/siteConfig.entity';
import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CustomPrismaService } from 'nestjs-prisma';
import { ExtendedPrismaClient } from 'prisma/prisma.extension';
import { SiteConfigDto } from 'prisma/src/generated/dto/siteConfig.dto';
import { UpdateSiteConfigDto } from 'prisma/src/generated/dto/update-siteConfig.dto';
import { transformResponse } from 'lib/utils/transform';
import { isNoChange } from 'lib/utils/isNoChange';
import { CreateSiteConfigDto } from './dto/create-siteConfig.dto';

@Injectable()
export class SiteConfigRepository {
  constructor(
    @Inject('PrismaService')
    private readonly prismaService: CustomPrismaService<ExtendedPrismaClient>,
  ) {}

  async create(
    tenantId: string,
    data: CreateSiteConfigDto,
  ): Promise<SiteConfigDto> {
    const siteConfig = await this.prismaService.client.siteConfig.create({
      data: {
        ...data,
        tenantId,
      },
    });
    return transformResponse(SiteConfigDto, siteConfig);
  }

  async findFirst(): Promise<SiteConfigDto> {
    const siteConfig = await this.prismaService.client.siteConfig.findFirst({
      include: {
        address: true, // Include address if needed
      },
    });
    return transformResponse(SiteConfigDto, siteConfig);
  }

  async findById(
    tenantId: string,
    siteConfigId: string,
  ): Promise<SiteConfigDto> {
    const config = await this.prismaService.client.siteConfig.findUnique({
      where: { tenantId_siteConfigId: { tenantId, siteConfigId } },
    });
    if (!config) {
      throw new NotFoundException(
        `SiteConfig with ID ${siteConfigId} not found`,
      );
    }
    return transformResponse(SiteConfigDto, config);
  }

  async update(
    tenantId: string,
    siteConfigId: string,
    data: UpdateSiteConfigDto,
  ): Promise<SiteConfigDto> {
    const existing = await this.prismaService.client.siteConfig.findUnique({
      where: { tenantId_siteConfigId: { tenantId, siteConfigId } },
    });
    if (!existing) {
      throw new NotFoundException(
        `SiteConfig with ID ${siteConfigId} not found`,
      );
    }
    const existingDto: UpdateSiteConfigDto = {
      companyName: existing.companyName,
      logoPath: existing.logoPath ?? undefined,
      email: existing.email,
      phoneNumber: existing.phoneNumber,
      iban: existing.iban ?? undefined,
      companyNumber: existing.companyNumber ?? undefined,
    };
    if (isNoChange<UpdateSiteConfigDto>(data, existingDto)) {
      throw new BadRequestException(
        `No changes detected for site config ${siteConfigId}`,
      );
    }
    const config = await this.prismaService.client.siteConfig.update({
      where: { tenantId_siteConfigId: { tenantId, siteConfigId } },
      data,
    });
    return transformResponse(SiteConfigDto, config);
  }
}
