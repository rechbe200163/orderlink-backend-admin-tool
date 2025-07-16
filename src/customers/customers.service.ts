import { Injectable } from '@nestjs/common';
import { CustomersRepository } from './customer.repository';
import { BusinessSector } from '@prisma/client';
import { TypedEventEmitter } from 'src/event-emitter/typed-event-emitter.class';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';

@Injectable()
export class CustomersService {
  constructor(
    // ✅ use `ExtendedPrismaClient` type for correct type-safety of your extended PrismaClient
    private readonly customerRepository: CustomersRepository,
    private readonly eventEmitter: TypedEventEmitter,
  ) {}

  async findCustomerByReference(customerReference: number) {
    return this.customerRepository.findCustomerByReference(customerReference);
  }

  async findAllCustomers(query?: string) {
    return this.customerRepository.findAllCustomers(query);
  }

  async getCustomers(
    limit: number = 10,
    page: number = 1,
    query?: string | undefined,
    businessSector?: BusinessSector,
  ) {
    return this.customerRepository.getCustomers(
      limit,
      page,
      query,
      businessSector,
    );
  }

  async createCustomer(customerData: CreateCustomerDto) {
    const { customer, password } =
      await this.customerRepository.createCustomer(customerData);
    if (customer) {
      // Emit an event after creating a customer
      this.eventEmitter.emit('customer.created', {
        firstName: customer.firstName || '',
        lastName: customer.lastName,
        email: customer.email,
        password: password || '', // Ensure password is included if available
      });
      console.log(`Customer created with password: ${password}`);
    }
    return customer;
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
