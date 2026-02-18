import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateSiteConfigDto } from 'prisma/src/generated/dto/create-siteConfig.dto';
import { SiteConfigDto } from 'prisma/src/generated/dto/siteConfig.dto';
import { UpdateSiteConfigDto } from 'prisma/src/generated/dto/update-siteConfig.dto';
import { transformResponse } from 'lib/utils/transform';
import { isNoChange } from 'lib/utils/isNoChange';
import { PrismaService } from 'src/prisma.service';

@Injectable()
export class SiteConfigRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: CreateSiteConfigDto): Promise<SiteConfigDto> {
    const siteConfig = await this.prisma.db.siteConfig.create({
      data: {
        ...data,
      },
    });
    return transformResponse(SiteConfigDto, siteConfig);
  }

  async findFirst(): Promise<SiteConfigDto> {
    const siteConfig = await this.prisma.db.siteConfig.findFirst({
      include: {
        address: true, // Include address if needed
      },
    });
    return transformResponse(SiteConfigDto, siteConfig);
  }

  async findById(siteConfigId: string): Promise<SiteConfigDto> {
    const config = await this.prisma.db.siteConfig.findUnique({
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
    const existing = await this.prisma.db.siteConfig.findUnique({
      where: { siteConfigId },
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
    const cleanData = Object.fromEntries(
      Object.entries(data).filter(([, value]) => value !== null),
    );
    const config = await this.prisma.db.siteConfig.update({
      where: { siteConfigId },
      data: cleanData,
    });
    return transformResponse(SiteConfigDto, config);
  }
}
