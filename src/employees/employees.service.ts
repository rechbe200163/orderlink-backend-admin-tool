import { Injectable } from '@nestjs/common';
import { EmployeesRepository } from './employees.repository';
import { Actions, Ressources } from '@prisma/client';
import { CreateEmployeesDto } from 'prisma/src/generated/dto/create-employees.dto';
import { UpdateEmployeesDto } from 'prisma/src/generated/dto/update-employees.dto';

@Injectable()
export class EmployeesService {
  constructor(
    private readonly employeesRepository: EmployeesRepository, // Assuming you have an EmployeesRepository
  ) {}
  create(createEmployeeDto: CreateEmployeesDto) {
    return this.employeesRepository.create(createEmployeeDto);
  }

  findAll(
    page: number = 1,
    limit: number = 10,
    search?: string,
    permissions?: {
      resource: Ressources;
      action: Actions;
      allowed: boolean;
    },
  ) {
    return this.employeesRepository.findAll(page, limit, search, permissions);
  }

  findById(id: string) {
    return this.employeesRepository.findById(id);
  }

  findByEmail(email: string) {
    return this.employeesRepository.findByEmail(email);
  }

  findByRole(role: string) {
    return this.employeesRepository.findByRole(role);
  }

  update(id: string, updateEmployeeDto: UpdateEmployeesDto) {
    return this.employeesRepository.update(id, updateEmployeeDto);
  }
}
