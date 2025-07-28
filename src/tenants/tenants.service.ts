import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { CreateTenantDto } from './dto/create-tenant.dto';
import { firstValueFrom } from 'rxjs';
const ServiceName = 'TENANTS_SERVICE';
@Injectable()
export class TenantsService {
  constructor(@Inject(ServiceName) private tenantsClient: ClientProxy) {}

  async create(data: CreateTenantDto): Promise<{
    message: string;
    tenant: CreateTenantDto;
  }> {
    console.log('Creating tenant with data:', data);
    const tenant$ = this.tenantsClient.send('create_tenant', { ...data });
    const tenant: { message: string; tenant: CreateTenantDto } =
      await firstValueFrom(tenant$);
    console.log('Created tenant:', tenant);
    return tenant;
  }
}
