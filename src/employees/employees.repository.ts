import { UpdateEmployeesDto } from 'prisma/src/generated/dto/update-employees.dto';
import { CreateEmployeesDto } from 'prisma/src/generated/dto/create-employees.dto';
import { PagingResultDto } from 'lib/dto/genericPagingResultDto';
import { RolesRepository } from './../roles/roles.repository';
import { transformResponse } from 'lib/utils/transform';
import { PRISMA_CLIENT } from 'lib/providers/prisma-client.provider';
import { isNoChange } from 'lib/utils/isNoChange';
import { Otp, PrismaClient } from '@generated/tenant/client';
import { customAlphabet } from 'nanoid';
import { hash } from 'bcryptjs';
import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { EmployeesDto } from './dto/employees.dto';
import { SortOrder } from 'src/common/enums/sort-order.enum';
import type { ExtendedPrismaClient } from 'src/tenant-prisma.service';
import { TenantDbContext } from 'lib/tenant-db-context';

@Injectable()
export class EmployeesRepository {
  constructor(
    // ✅ use `ExtendedPrismaClient` type for correct type-safety of your extended PrismaClient
    private readonly db: TenantDbContext,
    private readonly rolesRepository: RolesRepository,
  ) {}

  async create(createEmployeeDto: CreateEmployeesDto): Promise<{
    employee: EmployeesDto;
  }> {
    const existingEmployee = await this.db.prisma.employees.findUnique({
      where: { email: createEmployeeDto.email },
    });
    if (existingEmployee) {
      throw new BadRequestException(`Employee with this email already exists`);
    }
    const existingRole = await this.rolesRepository.findById(
      createEmployeeDto.roleId,
    );
    if (!existingRole) {
      throw new NotFoundException(
        `Role ${createEmployeeDto.roleId} does not exist`,
      );
    }

    const createdEmployee = await this.db.prisma.employees.create({
      data: {
        ...createEmployeeDto,
        password: '',
      },
    });
    return {
      employee: transformResponse(EmployeesDto, createdEmployee),
    };
  }

  async findAll(
    page: number = 1,
    limit: number = 10,
    includeRole: boolean,
    sort?: string,
    order?: SortOrder,
    search?: string,
    exludeEmployeeId?: string,
  ): Promise<PagingResultDto<EmployeesDto>> {
    const [employees, meta] = await this.db.prisma.employees
      .paginate({
        where: {
          employeeId: exludeEmployeeId ? { not: exludeEmployeeId } : undefined,
          deleted: false,
          lastName: {
            contains: search,
            mode: 'insensitive',
          },
        },
        include: {
          role: includeRole
            ? {
                select: {
                  name: true,
                },
              }
            : false,
        },
        orderBy: sort
          ? {
              [sort]: order || 'asc',
            }
          : undefined,
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

  async findById(employeeId: string, includeOtp = false) {
    const employee = (await this.db.prisma.employees.findUnique({
      where: { employeeId },
      ...(includeOtp && { include: { otp: true } }),
    })) as EmployeesDto & { Otp?: Otp };
    const base = transformResponse(EmployeesDto, employee);
    return includeOtp ? { ...base, Otp: employee?.Otp } : base;
  }

  // async findByRole(roleId: string) {
  //   // check if role exists
  //   const existingRole = await this.rolesRepository.findById(role);
  //   if (!existingRole) {
  //     throw new NotFoundException(`Role ${role} does not exist`);
  //   }
  //   const employees = await this.db.prisma.employees.findByRole(role);
  //   return transformResponse(EmployeesDto, employees);
  // }

  async findByEmail(email: string) {
    const employee = await this.db.prisma.employees.findUnique({
      where: { email },
    });
    if (!employee) {
      throw new NotFoundException(`Employee with email ${email} not found`);
    }
    return transformResponse(EmployeesDto, employee);
  }

  async update(employeeId: string, updateEmployee: UpdateEmployeesDto) {
    const existingEmployee = await this.findById(employeeId);
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
    const updatedEmployee = await this.db.prisma.employees.update({
      where: { employeeId },
      data: updateEmployee,
    });
    return transformResponse(EmployeesDto, updatedEmployee);
  }

  async findAdminEmails(): Promise<string[]> {
    const admins = await this.db.prisma.employees.findMany({
      where: {
        role: {
          name: 'ADMIN',
        },
        deleted: false,
      },
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
