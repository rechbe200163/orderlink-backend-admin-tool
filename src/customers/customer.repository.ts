import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CustomPrismaService } from 'nestjs-prisma';
import { ExtendedPrismaClient } from 'prisma/prisma.extension';
import { CustomerDto } from 'src/customers/dto/customer.dto';
import { CustomerPagingResultDto } from './dto/customer-paging.dto';
import { BusinessSector, Prisma, PrismaPromise } from '@prisma/client';
import { CreateCustomerDto } from 'src/customers/dto/create-customer.dto';
import { customAlphabet } from 'nanoid';
import { hash } from 'bcryptjs';
import { UpdateCustomerDto } from 'src/customers/dto/update-customer.dto';
import { isNoChange } from 'lib/utils/isNoChange';
import { transformResponse } from 'lib/utils/transform';

@Injectable()
export class CustomersRepository {
  constructor(
    // ✅ use `ExtendedPrismaClient` type for correct type-safety of your extended PrismaClient
    @Inject('PrismaService')
    private prismaService: CustomPrismaService<ExtendedPrismaClient>,
  ) {}

  async findCustomerByEmail(email: string): Promise<CustomerDto> {
    const customer =
      await this.prismaService.client.customer.findCustomerByEmail(email);
    if (!customer) {
      throw new NotFoundException(`Customer with email ${email} not found`);
    }
    return transformResponse(CustomerDto, customer);
  }

  async findCustomerByReference(
    customerReference: number,
  ): Promise<CustomerDto> {
    const customer =
      await this.prismaService.client.customer.findByReference(
        customerReference,
      );
    if (!customer) {
      throw new NotFoundException(
        `Customer with reference ${customerReference} not found`,
      );
    }
    return transformResponse(CustomerDto, customer);
  }

  async getCustomers(
    limit?: number,
    page?: number,
    businessSector?: BusinessSector,
  ): Promise<CustomerPagingResultDto> {
    console.log('businessSector', businessSector);
    const [users, meta] = await this.prismaService.client.customer
      .paginate({
        where: {
          ...(businessSector && { businessSector }),
        },
      })
      .withPages({
        limit: limit || 10, // Default
        page: page || 1, // Default page
        includePageCount: true, // Include total page count
      });

    return {
      data: users.map((user: CustomerDto) =>
        transformResponse(CustomerDto, user),
      ),
      meta,
    };
  }

  async createCustomer(customerData: CreateCustomerDto): Promise<{
    customer: CustomerDto;
    password: string;
  }> {
    // hash password
    const password = this.generateCustomerPassword();
    const hashedPassword = await hash(password, 10);
    const customerEntity: Prisma.CustomerCreateInput = {
      customerReference: this.generateCustomerReferenceNumber(),
      email: customerData.email,
      phoneNumber: customerData.phoneNumber,
      password: hashedPassword,
      firstName: customerData.firstName,
      lastName: customerData.lastName,
      companyNumber: customerData.companyNumber,
      avatarPath: customerData.avatarPath || null,
      businessSector: customerData.businessSector || null,
      address: {
        connect: customerData.addressId
          ? { addressId: customerData.addressId }
          : undefined,
      },
    };

    const customer = await this.prismaService.client.customer.create({
      data: customerEntity,
    });
    return {
      customer: transformResponse(CustomerDto, customer),
      password,
    };
  }

  async updateCustomer(
    customerReference: number,
    customerData: UpdateCustomerDto,
  ): Promise<CustomerDto> {
    const originalCustomer =
      await this.prismaService.client.customer.findByReference(
        customerReference,
      );

    if (!originalCustomer) {
      throw new NotFoundException('Customer not found');
    }

    if (isNoChange<UpdateCustomerDto>(customerData, originalCustomer)) {
      throw new BadRequestException('No changes detected');
    }

    // Exclude customerId from history entry
    const { customerId, ...customerHistoryData } = originalCustomer;

    const [, updatedCustomer] = await this.prismaService.client.$transaction([
      this.prismaService.client.customerHistory.create({
        data: customerHistoryData,
      }),
      this.prismaService.client.customer.update({
        where: { customerReference },
        data: customerData,
      }),
    ]);

    return transformResponse(CustomerDto, updatedCustomer);
    // Update only the fields that are provided
  }

  private generateCustomerReferenceNumber(): number {
    const nanoid = customAlphabet('1234567890', 9);
    return Number(nanoid());
  }

  private generateCustomerPassword(): string {
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
