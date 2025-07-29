import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { CreateTenantDto } from './dto/create-tenant.dto';
import { firstValueFrom } from 'rxjs';
import { SiteConfigService } from 'src/site-config/site-config.service';
import { TenantDto } from './dto/tenant-entity.dto';
const ServiceName = 'TENANTS_SERVICE';
@Injectable()
export class TenantsService {
  constructor(@Inject(ServiceName) private tenantsClient: ClientProxy) {}

  async create(data: CreateTenantDto): Promise<{
    tenantId: string;
  }> {
    console.log('Creating tenant with data:', data);
    const tenant$ = this.tenantsClient.send('create_tenant', { ...data });
    const tenant: { tenantId: string } = await firstValueFrom(tenant$);
    console.log('Created tenant:', tenant);
    return tenant;
  }

  async getTenantById(tenantId: string): Promise<TenantDto> {
    const tenant = await this.tenantsClient.send('get_tenant_by_id', {
      tenantId,
    });
    return firstValueFrom(tenant);
  }
}
