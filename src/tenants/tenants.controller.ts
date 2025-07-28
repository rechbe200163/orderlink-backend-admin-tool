import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { TenantsService } from './tenants.service';
import { CreateTenantDto } from './dto/create-tenant.dto';

@Controller()
export class TenantsController {
  constructor(private readonly tenantsService: TenantsService) {}

  @MessagePattern('createTenant')
  async create(@Payload() createTenantDto: CreateTenantDto) {
    const data = await this.tenantsService.create(createTenantDto);
    return data;
  }

  // @MessagePattern('findAllTenants')
  // findAll() {
  //   return this.tenantsService.findAll();
  // }

  // @MessagePattern('findOneTenant')
  // findOne(@Payload() id: number) {
  //   return this.tenantsService.findOne(id);
  // }

  // @MessagePattern('updateTenant')
  // update(@Payload() updateTenantDto: UpdateTenantDto) {
  //   return this.tenantsService.update(updateTenantDto.id, updateTenantDto);
  // }

  // @MessagePattern('removeTenant')
  // remove(@Payload() id: number) {
  //   return this.tenantsService.remove(id);
  // }
}
