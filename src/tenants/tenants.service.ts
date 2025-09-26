import { Inject, Injectable, Logger } from '@nestjs/common';
import { CreateTenantDto } from './dto/create-tenant.dto';
import { UpdateTenantDto } from './dto/update-tenant.dto';
import { Cron, CronExpression } from '@nestjs/schedule';
import { CustomPrismaService } from 'nestjs-prisma';
import { ExtendedPrismaClient } from 'prisma/prisma.extension';
import { TenantStatus } from '@prisma/client';

@Injectable()
export class TenantsService {
  private readonly logger = new Logger(TenantsService.name);
  constructor(
    // ✅ use `ExtendedPrismaClient` type for correct type-safety of your extended PrismaClient
    @Inject('PrismaService')
    private prismaService: CustomPrismaService<ExtendedPrismaClient>,
  ) {}

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT, { timeZone: 'Europe/Vienna' })
  async revokeExpiredTrials() {
    const now = new Date();

    // 1) Alle abgelaufenen Trials holen
    const expired = await this.prismaService.client.tenant.findMany({
      where: {
        status: TenantStatus.TRIAL,
        trialEndsAt: { lt: now },
      },
      select: { tenantId: true, slug: true },
    });

    if (!expired.length) {
      this.logger.log('No expired trials found.');
      return;
    }

    this.logger.log(
      `Found ${expired.length} expired trials. Revoking modules...`,
    );

    // 2) Für jeden Tenant: EnabledModule löschen & Status anpassen
    for (const t of expired) {
      await this.prismaService.client.$transaction(async (tx) => {
        // Entfernt alle aktivierten Module
        await tx.enabledModule.deleteMany({
          where: { tenantId: t.tenantId },
        });

        // Status setzen (Option: SUSPENDED, bis Zahlung aktiv)
        await tx.tenant.update({
          where: { tenantId: t.tenantId },
          data: { status: TenantStatus.SUSPENDED },
        });
      });

      this.logger.log(
        `Revoked modules & suspended tenant ${t.slug} (${t.tenantId}).`,
      );
    }
  }
  create(createTenantDto: CreateTenantDto) {
    return 'This action adds a new tenant';
  }

  findAll() {
    return `This action returns all tenants`;
  }

  findOne(id: number) {
    return `This action returns a #${id} tenant`;
  }

  update(id: number, updateTenantDto: UpdateTenantDto) {
    return `This action updates a #${id} tenant`;
  }

  remove(id: number) {
    return `This action removes a #${id} tenant`;
  }
}
