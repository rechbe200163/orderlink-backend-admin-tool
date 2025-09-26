import { Injectable } from '@nestjs/common';
import { CreatePermissionsDto } from './dto/create-permissions.dto';
import { UpdatePermissionDto } from 'prisma/src/generated/dto/update-permission.dto';
import { PermissionsRepository } from './permissions.repository';

@Injectable()
export class PermissionsService {
  constructor(private permissionsRepository: PermissionsRepository) {}

  create(tenantId: string, createPermissionsDto: CreatePermissionsDto) {
    return this.permissionsRepository.create(tenantId, createPermissionsDto);
  }

  findAllPaging(
    tenantId: string,
    limit: number = 10,
    page: number = 1,
    role?: string,
  ) {
    return this.permissionsRepository.findAll(tenantId, limit, page, role);
  }

  findAllPermissions(tenantId: string, role?: string) {
    return this.permissionsRepository.findAllPermissions(tenantId, role);
  }

  findOne(tenantId: string, id: string) {
    return this.permissionsRepository.findById(tenantId, id);
  }

  update(
    tenantId: string,
    id: string,
    updatePermissionDto: UpdatePermissionDto,
  ) {
    return this.permissionsRepository.update(tenantId, id, updatePermissionDto);
  }
}
