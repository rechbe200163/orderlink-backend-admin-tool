import { SiteConfigDto } from 'prisma/src/generated/dto/siteConfig.dto';
import { TenantDto } from 'src/tenants/dto/tenant-entity.dto';

export class SiteConfigWithTenantDto {
  siteConfig: SiteConfigDto;
  tenant: TenantDto;
}
