import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { CustomPrismaService } from 'nestjs-prisma';
import { ExtendedPrismaClient } from 'prisma/prisma.extension';

@Injectable()
export class EmployeesService {
  constructor(
    @Inject('PrismaService')
    private prismaService: CustomPrismaService<ExtendedPrismaClient>,
  ) {}

  async findEmployeeByEmail(email: string) {
    try {
      console.log('Finding employee by email:', email);
      return this.prismaService.client.employees.findEmployeeByEmail(email);
    } catch (error) {
      console.error('Error finding employee by email:', error);
      throw new NotFoundException('Employee not found or an error occurred');
    }
  }

  // Add other employee-related methods as needed
}
