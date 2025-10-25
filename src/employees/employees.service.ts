import { Tenant } from './../tenants/entities/tenant.entity';
import { Injectable } from '@nestjs/common';
import { EmployeesRepository } from './employees.repository';
import { Actions } from '@prisma/client';
import { Resources } from '../../lib/rbac/resources.enum';
import { CreateEmployeesDto } from 'prisma/src/generated/dto/create-employees.dto';
import { UpdateEmployeesDto } from 'prisma/src/generated/dto/update-employees.dto';
import { transformResponse } from 'lib/utils/transform';
import { EmployeesDto } from 'prisma/src/generated/dto/employees.dto';
import { TypedEventEmitter } from 'src/event-emitter/typed-event-emitter.class';
import { TenantsRepository } from 'src/tenants/tenants.repository';

@Injectable()
export class EmployeesService {
  constructor(
    private readonly employeesRepository: EmployeesRepository, // Assuming you have an EmployeesRepository
    private readonly eventEmitter: TypedEventEmitter, // Assuming you have a TypedEventEmitter for event handling
    private readonly tenantsRepository: TenantsRepository, // Assuming you have a TenantsRepository to fetch tenant details
  ) {}
  async create(
    tenantId: string,
    createEmployeeDto: CreateEmployeesDto,
  ): Promise<CreateEmployeesDto> {
    const { employee } = await this.employeesRepository.create(
      tenantId,
      createEmployeeDto,
    );
    const tenantSlug = await this.tenantsRepository.findById(tenantId);
    if (employee) {
      // Emit an event after creating a employee
      this.eventEmitter.emit('employee.created', {
        tenant: {
          tenantId,
          tenantSlug,
        },
        employeeId: employee.employeeId,
        firstName: employee.firstName || '',
        lastName: employee.lastName,
        email: employee.email,
      });
    }
    return transformResponse(EmployeesDto, employee);
  }

  findAll(
    tenantId: string,
    page: number = 1,
    limit: number = 10,
    search?: string,
    permissions?: {
      resource: Resources;
      action: Actions;
      allowed: boolean;
    },
  ) {
    return this.employeesRepository.findAll(
      tenantId,
      page,
      limit,
      search,
      permissions,
    );
  }

  findById(tenantId: string, id: string, includeOtp = false) {
    return this.employeesRepository.findById(tenantId, id, includeOtp);
  }

  findByEmail(tenantId: string, email: string) {
    return this.employeesRepository.findByEmail(tenantId, email);
  }

  findByRole(tenantId: string, role: string) {
    return this.employeesRepository.findByRole(tenantId, role);
  }

  update(tenantId: string, id: string, updateEmployeeDto: UpdateEmployeesDto) {
    return this.employeesRepository.update(tenantId, id, updateEmployeeDto);
  }

  updateProfile(
    tenantId: string,
    id: string,
    updateEmployeeDto: UpdateEmployeesDto,
  ) {
    return this.employeesRepository.update(tenantId, id, updateEmployeeDto);
  }
}
