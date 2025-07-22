import { Injectable } from '@nestjs/common';
import { EmployeesRepository } from './employees.repository';
import { Actions } from '@prisma/client';
import { Resources } from '../rbac/resources.enum';
import { CreateEmployeesDto } from 'prisma/src/generated/dto/create-employees.dto';
import { UpdateEmployeesDto } from 'prisma/src/generated/dto/update-employees.dto';
import { transformResponse } from 'lib/utils/transform';
import { EmployeesDto } from 'prisma/src/generated/dto/employees.dto';
import { TypedEventEmitter } from 'src/event-emitter/typed-event-emitter.class';

@Injectable()
export class EmployeesService {
  constructor(
    private readonly employeesRepository: EmployeesRepository, // Assuming you have an EmployeesRepository
    private readonly eventEmitter: TypedEventEmitter, // Assuming you have a TypedEventEmitter for event handling
  ) {}
  async create(
    createEmployeeDto: CreateEmployeesDto,
  ): Promise<CreateEmployeesDto> {
    const { employee, password } =
      await this.employeesRepository.create(createEmployeeDto);
    if (employee) {
      // Emit an event after creating a employee
      this.eventEmitter.emit('employee.created', {
        employeeId: employee.employeeId,
        firstName: employee.firstName || '',
        lastName: employee.lastName,
        email: employee.email,
        password: password || '', // Ensure password is included if available
      });
      console.log(`Employee created with password: ${password}`);
    }
    return transformResponse(EmployeesDto, employee);
  }

  findAll(
    page: number = 1,
    limit: number = 10,
    search?: string,
    permissions?: {
      resource: Resources;
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

  updateProfile(id: string, updateEmployeeDto: UpdateEmployeesDto) {
    return this.employeesRepository.update(id, updateEmployeeDto);
  }
}
