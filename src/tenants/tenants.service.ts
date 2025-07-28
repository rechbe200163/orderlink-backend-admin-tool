import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { CreateTenantDto } from './dto/create-tenant.dto';
const ServiceName = 'TENANTS_SERVICE';
@Injectable()
export class TenantsService {
  constructor(@Inject(ServiceName) private tenantsService: ClientProxy) {}

  create(data: CreateTenantDto) {
    console.log('Creating tenant with data:', data);
    return this.tenantsService.emit('create_tenant', { ...data });
  }
}
