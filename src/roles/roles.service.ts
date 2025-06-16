import { Injectable } from '@nestjs/common';
import { RolesRepository } from './roles.repository';
import { UpdateRoleDto } from 'prisma/src/generated/dto/update-role.dto';
import { CreateRoleDto } from 'prisma/src/generated/dto/create-role.dto';

@Injectable()
export class RolesService {
  constructor(private readonly rolesRepository: RolesRepository) {}

  create(createRoleDto: CreateRoleDto) {
    return this.rolesRepository.create(createRoleDto);
  }

  findAll(limit: number = 10, page: number = 1, search: string = '') {
    return this.rolesRepository.findAll(limit, page, search);
  }

  findOne(name: string) {
    return this.rolesRepository.findByName(name);
  }

  update(name: string, updateRoleDto: UpdateRoleDto) {
    return this.rolesRepository.update(name, updateRoleDto);
  }
}
