import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { CreateTenantDto } from './dto/create-tenant.dto';
const ServiceName = 'TENANTS_SERVICE';
@Injectable()
export class TenantsService {
  constructor(@Inject(ServiceName) private tenantsClient: ClientProxy) {}

  async create(data: CreateTenantDto) {
    console.log('Creating tenant with data:', data);
    const tenant = await this.tenantsClient.send('create_tenant', { ...data });
    console.log('Created tenant:', tenant);
    return tenant;
  }
}
