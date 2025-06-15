import { Injectable } from '@nestjs/common';
import { CustomersRepository } from './customer.repository';
import { CreateCustomerDto } from 'prisma/src/generated/dto/create-customer.dto';
import { UpdateCustomerDto } from 'prisma/src/generated/dto/update-customer.dto';
import { BusinessSector } from '@prisma/client';

@Injectable()
export class CustomersService {
  constructor(
    // ✅ use `ExtendedPrismaClient` type for correct type-safety of your extended PrismaClient
    private readonly customerRepository: CustomersRepository,
  ) {}

  async findCustomerByReference(customerReference: number) {
    return this.customerRepository.findCustomerByReference(customerReference);
  }

  async getCustomers(
    limit: number = 10,
    page: number = 1,
    businessSector?: BusinessSector,
  ) {
    return this.customerRepository.getCustomers(limit, page, businessSector);
  }

  async createCustomer(customerData: CreateCustomerDto) {
    return this.customerRepository.createCustomer(customerData);
  }

  async updateCustomer(
    customerReference: number,
    customerData: UpdateCustomerDto,
  ) {
    return this.customerRepository.updateCustomer(
      customerReference,
      customerData,
    );
  }
}
