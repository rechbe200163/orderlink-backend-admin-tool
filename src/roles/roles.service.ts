import { Injectable } from '@nestjs/common';
import { RolesRepository } from './roles.repository';
import { UpdateRoleDto } from 'prisma/src/generated/dto/update-role.dto';
import { CreateRoleDto } from 'prisma/src/generated/dto/create-role.dto';

@Injectable()
export class RolesService {
  constructor(private readonly rolesRepository: RolesRepository) {}

  create(tenantId: string, createRoleDto: CreateRoleDto) {
    return this.rolesRepository.create(tenantId, createRoleDto);
  }

  findAll(
    tenantId: string,
    limit: number = 10,
    page: number = 1,
    search: string = '',
  ) {
    return this.rolesRepository.findAll(tenantId, limit, page, search);
  }

  findOne(tenantId: string, name: string) {
    return this.rolesRepository.findByName(tenantId, name);
  }

  findAllRoleNames(tenantId: string) {
    return this.rolesRepository.findAllRoleNames(tenantId);
  }

  update(tenantId: string, name: string, updateRoleDto: UpdateRoleDto) {
    return this.rolesRepository.update(tenantId, name, updateRoleDto);
  }
}
