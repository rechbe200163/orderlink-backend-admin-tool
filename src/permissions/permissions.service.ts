import { Injectable } from '@nestjs/common';
import { CreatePermissionDto } from 'prisma/src/generated/dto/create-permission.dto';
import { CreatePermissionsDto } from './dto/create-permissions.dto';
import { UpdatePermissionDto } from 'prisma/src/generated/dto/update-permission.dto';
import { PermissionsRepository } from './permissions.repository';

@Injectable()
export class PermissionsService {
  constructor(private permissionsRepository: PermissionsRepository) {}

  create(createPermissionsDto: CreatePermissionsDto) {
    return this.permissionsRepository.create(createPermissionsDto);
  }

  createMany(createPermissionsDto: CreatePermissionsDto) {
    return this.permissionsRepository.createMany(createPermissionsDto);
  }

  findAllPaging(limit: number = 10, page: number = 1, role?: string) {

    return this.permissionsRepository.findAll(limit, page, role);
  }

  findAllPermissions(role?: string) {
    return this.permissionsRepository.findAllPermissions(role);
  }

  findOne(id: string) {
    return this.permissionsRepository.findById(id);
  }

  update(id: string, updatePermissionDto: UpdatePermissionDto) {
    return this.permissionsRepository.update(id, updatePermissionDto);
  }
}
