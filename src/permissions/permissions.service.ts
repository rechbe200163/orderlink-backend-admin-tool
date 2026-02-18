import { Injectable } from '@nestjs/common';
import { PermissionsRepository } from './permissions.repository';
import { CreatePermissionsDto } from './dto/create-permision.dto';
import { UpdatePermissionDto } from './dto/update-permision.dto';

@Injectable()
export class PermissionsService {
  constructor(private permissionsRepository: PermissionsRepository) {}

  create(createPermissionsDto: CreatePermissionsDto) {
    return this.permissionsRepository.create(createPermissionsDto);
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
