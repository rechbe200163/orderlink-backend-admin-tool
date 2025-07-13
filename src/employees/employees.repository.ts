import { hash } from 'bcryptjs';
import { PagingResultDto } from 'lib/dto/genericPagingResultDto';
import { RolesRepository } from './../roles/roles.repository';
import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Actions } from '@prisma/client';
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

  async create(createEmployeeDto: CreateEmployeesDto): Promise<{
    employee: EmployeesDto;
    password: string;
  }> {
    const existingEmployee =
      await this.prismaService.client.employees.findEmployeeByEmail(
        createEmployeeDto.email,
      );
    if (existingEmployee) {
      throw new BadRequestException(`Employee with this email already exists`);
    }
    const existingRole = await this.rolesRepository.findByName(
      createEmployeeDto.role,
    );
    if (!existingRole) {
      throw new NotFoundException(
        `Role ${createEmployeeDto.role} does not exist`,
      );
    }

    const password = this.generateEmployeePassword();
    const hashedPassword = await hash(password, 10);

    const createdEmployee = await this.prismaService.client.employees.create({
      data: {
        ...createEmployeeDto,
        password: hashedPassword,
      },
    });
    return {
      employee: transformResponse(EmployeesDto, createdEmployee),
      password,
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

  async findById(employeeId: string) {
    const employee =
      await this.prismaService.client.employees.findById(employeeId);
    return transformResponse(EmployeesDto, employee);
  }

  async findByRole(role: string) {
    // check if role exists
    const existingRole = await this.rolesRepository.findByName(role);
    if (!existingRole) {
      throw new NotFoundException(`Role ${role} does not exist`);
    }
    const employees =
      await this.prismaService.client.employees.findByRole(role);
    return transformResponse(EmployeesDto, employees);
  }

  async findByEmail(email: string) {
    const employee =
      await this.prismaService.client.employees.findEmployeeByEmail(email);
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
    if (isNoChange(updateEmployee, existingEmployee)) {
      throw new BadRequestException(
        `No changes detected for employee ${employeeId}`,
      );
    }
    const updatedEmployee = await this.prismaService.client.employees.update({
      where: { employeeId },
      data: updateEmployee,
    });
    return transformResponse(EmployeesDto, updatedEmployee);
  }

  async findAdminEmails(): Promise<string[]> {
    const admins = await this.prismaService.client.employees.findMany({
      where: { role: 'ADMIN', superAdmin: true, deleted: false },
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
