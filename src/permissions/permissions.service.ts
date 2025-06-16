import { Injectable } from '@nestjs/common';
import { CreatePermissionDto } from 'prisma/src/generated/dto/create-permission.dto';
import { UpdatePermissionDto } from 'prisma/src/generated/dto/update-permission.dto';
import { PermissionsRepository } from './permissions.repository';

@Injectable()
export class PermissionsService {
  constructor(private permissionsRepository: PermissionsRepository) {}

  create(createPermissionDto: CreatePermissionDto) {
    return this.permissionsRepository.create(createPermissionDto);
  }

  findAll(limit: number = 10, page: number = 1, role?: string) {
    return this.permissionsRepository.findAll(limit, page, role);
  }

  findOne(id: string) {
    return this.permissionsRepository.findById(id);
  }

  update(id: string, updatePermissionDto: UpdatePermissionDto) {
    return this.permissionsRepository.update(id, updatePermissionDto);
  }
}
