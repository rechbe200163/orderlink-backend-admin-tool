import {
  ConflictException,
  Inject,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import slugify from 'slugify';
import { nanoid } from 'nanoid';
import { CustomPrismaService } from 'nestjs-prisma';
import { ExtendedPrismaClient } from 'prisma/prisma.extension';
import { CreateOnboardingDto } from './dto/create-onboarding.dto';
import { UpdateOnboardingDto } from './dto/update-onboarding.dto';
import { TypedEventEmitter } from 'src/event-emitter/typed-event-emitter.class';
import { seedTenantRBAC } from 'lib/common/rbac/seed-tenant-rbac';
import { enableAllModulesForTenantDuringTrial } from 'lib/common/modules/enable-modules.seed';

@Injectable()
export class OnboardingsService {
  constructor(
    @Inject('PrismaService')
    private readonly prisma: CustomPrismaService<ExtendedPrismaClient>,
    private readonly eventEmitter: TypedEventEmitter, // Assuming you have a TypedEventEmitter for event handling
  ) {}

  private async ensureUniqueSlug(base: string): Promise<string> {
    console.log('Ensuring unique slug for base:', base);
    let candidate = base || 'company';
    for (let i = 0; i < 6; i++) {
      const exists = await this.prisma.client.tenant.findUnique({
        where: { slug: candidate },
      });
      if (!exists) {
        return candidate;
      }
      candidate = `${base}-${nanoid()}`;
    }
    throw new ConflictException('Slug generation failed, please retry.');
  }

  async create(dto: CreateOnboardingDto) {
    console.log('Creating onboarding with DTO:', dto);
    const baseSlug =
      slugify(dto.siteConfig.companyName, { lower: true, strict: true }) ||
      'company';
    const slug = await this.ensureUniqueSlug(baseSlug);

    try {
      return this.prisma.client.$transaction(async (tx) => {
        // 1) Tenant
        const tenant = await tx.tenant.create({
          data: { name: dto.siteConfig.companyName, slug },
          select: { tenantId: true, slug: true, name: true },
        });
        console.log('Created tenant:', tenant);

        // 2) Address (gehört dem Tenant)
        const address = await tx.address.create({
          data: {
            tenantId: tenant.tenantId,
            city: dto.address.city,
            country: dto.address.country,
            postCode: dto.address.postCode,
            state: dto.address.state,
            streetName: dto.address.streetName,
            streetNumber: dto.address.streetNumber,
          },
          select: { addressId: true },
        });
        console.log('Created address:', address);

        // 3) SiteConfig (connect via Composite-FK [tenantId, addressId])
        const siteConfig = await tx.siteConfig.create({
          data: {
            tenantId: tenant.tenantId,
            companyName: dto.siteConfig.companyName,
            email: dto.siteConfig.email,
            phoneNumber: dto.siteConfig.phoneNumber,
            iban: dto.siteConfig.iban ?? null,
            companyNumber: dto.siteConfig.companyNumber ?? null,
            addressId: address.addressId,
          },
          include: { address: true },
        });
        console.log('Created siteConfig:', siteConfig);

        await seedTenantRBAC({
          tx,
          tenantId: tenant.tenantId,
        });

        await enableAllModulesForTenantDuringTrial({
          tx,
          tenantId: tenant.tenantId,
        });

        const employee = await tx.employees.create({
          data: {
            tenantId: tenant.tenantId,
            email: dto.siteConfig.email,
            firstName: 'initial',
            lastName: 'admin',
            superAdmin: false,
            password: 'changeMe123!',
            roleName: 'ADMIN',
          },
        });
        console.log('Created initial employee:', employee);
        if (employee) {
          // Emit an event after creating a employee
          this.eventEmitter.emit('employee.created', {
            tenant: {
              tenantId: tenant.tenantId,
              tenantSlug: tenant.slug,
            },
            employeeId: employee.employeeId,
            firstName: employee.firstName || '',
            lastName: employee.lastName,
            email: employee.email,
          });
        }

        return { tenant, siteConfig };
      });
    } catch (e: any) {
      if (
        e?.code === 'P2002' &&
        e?.meta?.target?.includes('tenant_slug_index')
      ) {
        throw new ConflictException('Slug already exists.');
      }
      if (
        e?.code === 'P2002' &&
        e?.meta?.target?.includes('site_config_tenant_email_unique')
      ) {
        throw new ConflictException('Email already used for this tenant.');
      }
      throw new InternalServerErrorException('Onboarding failed.');
    }
  }

  findAll() {
    return `This action returns all onboardings`;
  }

  findOne(id: number) {
    return `This action returns a #${id} onboarding`;
  }

  update(id: number, updateOnboardingDto: UpdateOnboardingDto) {
    return `This action updates a #${id} onboarding`;
  }

  remove(id: number) {
    return `This action removes a #${id} onboarding`;
  }
}
