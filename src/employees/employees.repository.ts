import { hash } from 'bcryptjs';
import { PagingResultDto } from 'lib/dto/genericPagingResultDto';
import { RolesRepository } from './../roles/roles.repository';
import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Actions, Otp } from '@prisma/client';
import { Resources } from '../rbac/resources.enum';
import { isNoChange } from 'lib/utils/isNoChange';
import { transformResponse } from 'lib/utils/transform';
import { CustomPrismaService } from 'nestjs-prisma';
import { ExtendedPrismaClient } from 'prisma/prisma.extension';
import { UpdateEmployeesDto } from 'prisma/src/generated/dto/update-employees.dto';
import { EmployeesDto } from 'prisma/src/generated/dto/employees.dto';
import { CreateEmployeesDto } from 'prisma/src/generated/dto/create-employees.dto';
import { customAlphabet } from 'nanoid';

@Injectable()
export class EmployeesRepository {
  constructor(
    // ✅ use `ExtendedPrismaClient` type for correct type-safety of your extended PrismaClient
    @Inject('PrismaService')
    private prismaService: CustomPrismaService<ExtendedPrismaClient>,
    private readonly rolesRepository: RolesRepository,
  ) {}

  async create(
    tenantId: string,
    createEmployeeDto: CreateEmployeesDto,
  ): Promise<{
    employee: EmployeesDto;
  }> {
    const existingEmployee =
      await this.prismaService.client.employees.findEmployeeByEmail(
        tenantId,
        createEmployeeDto.email,
      );
    if (existingEmployee) {
      throw new BadRequestException(`Employee with this email already exists`);
    }
    const existingRole = await this.rolesRepository.findByName(
      tenantId,
      createEmployeeDto.roleName,
    );
    if (!existingRole) {
      throw new NotFoundException(
        `Role ${createEmployeeDto.roleName} does not exist`,
      );
    }

    const createdEmployee = await this.prismaService.client.employees.create({
      data: {
        ...createEmployeeDto,
        password: '',
        tenantId,
      },
    });
    return {
      employee: transformResponse(EmployeesDto, createdEmployee),
    };
  }

  async findAll(
    page: number = 1,
    limit: number = 10,
    search?: string,
    permissions?: {
      resource: Resources;
      action: Actions;
      allowed: boolean;
    },
  ): Promise<PagingResultDto<EmployeesDto>> {
    if (permissions) {
      const [employees, meta] =
        await this.prismaService.client.employees.findByPermission(
          {
            limit,
            page,
          },
          permissions,
        );

      return {
        data: employees.map((employee: EmployeesDto) =>
          transformResponse(EmployeesDto, employee),
        ),
        meta,
      };
    }
    const [employees, meta] = await this.prismaService.client.employees
      .paginate({
        where: {
          deleted: false,
          lastName: {
            contains: search,
            mode: 'insensitive',
          },
        },
      })
      .withPages({
        limit,
        page,
        includePageCount: true, // Include total page count
      });
    return {
      data: employees.map((employee: EmployeesDto) =>
        transformResponse(EmployeesDto, employee),
      ),
      meta,
    };
  }

  async findById(tenantId: string, employeeId: string, includeOtp = false) {
    const employee = (await this.prismaService.client.employees.findUnique({
      where: {
        tenantId_employeeId: { tenantId, employeeId },
      },
      ...(includeOtp && { include: { Otp: true } }),
    })) as EmployeesDto & { Otp?: Otp };
    const base = transformResponse(EmployeesDto, employee);
    return includeOtp ? { ...base, Otp: employee?.Otp } : base;
  }

  async findByRole(tenantId: string, role: string) {
    // check if role exists
    const existingRole = await this.rolesRepository.findByName(tenantId, role);
    if (!existingRole) {
      throw new NotFoundException(`Role ${role} does not exist`);
    }
    const employees = await this.prismaService.client.employees.findByRole(
      tenantId,
      role,
    );
    return transformResponse(EmployeesDto, employees);
  }

  async findByEmail(tenantId: string, email: string) {
    const employee =
      await this.prismaService.client.employees.findEmployeeByEmail(
        tenantId,
        email,
      );
    if (!employee) {
      throw new NotFoundException(`Employee with email ${email} not found`);
    }
    return transformResponse(EmployeesDto, employee);
  }

  async update(
    tenantId: string,
    employeeId: string,
    updateEmployee: UpdateEmployeesDto,
  ) {
    const existingEmployee = await this.findById(tenantId, employeeId);
    if (!existingEmployee) {
      throw new NotFoundException(`Employee with ID ${employeeId} not found`);
    }
    if (updateEmployee.password) {
      updateEmployee.password = await hash(updateEmployee.password, 10);
    }
    console.log(
      `Updating employee with ID ${employeeId} with data:`,
      updateEmployee,
    );
    if (isNoChange(updateEmployee, existingEmployee)) {
      console.log('No changes detected for employee', updateEmployee);
      console.log('Existing employee data:', existingEmployee);
      throw new BadRequestException(
        `No changes detected for employee ${employeeId}`,
      );
    }
    const updatedEmployee = await this.prismaService.client.employees.update({
      where: {
        tenantId_employeeId: { tenantId, employeeId },
      },
      data: updateEmployee,
    });
    return transformResponse(EmployeesDto, updatedEmployee);
  }

  async findAdminEmails(tenantId: string): Promise<string[]> {
    const admins = await this.prismaService.client.employees.findMany({
      where: { roleName: 'ADMIN', superAdmin: true, deleted: false, tenantId },
      select: { email: true },
    });
    return admins.map((admin) => admin.email);
  }

  private generateEmployeePassword(): string {
    const nanoid = customAlphabet(
      'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789',
      18,
    );
    // Format: xxxxxx-xxxxxxx-xxxxxx
    const part1 = nanoid(6);
    const part2 = nanoid(6);
    const part3 = nanoid(6);
    return `${part1}-${part2}-${part3}`;
  }
}
