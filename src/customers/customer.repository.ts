import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CustomerPagingResultDto } from './dto/customer-paging.dto';
import { CreateCustomerDto } from 'src/customers/dto/create-customer.dto';
import { customAlphabet } from 'nanoid';
import { hash } from 'bcryptjs';
import { UpdateCustomerDto } from 'src/customers/dto/update-customer.dto';
import { isNoChange } from 'lib/utils/isNoChange';
import { transformResponse } from 'lib/utils/transform';
import { PRISMA_CLIENT } from 'lib/providers/prisma-client.provider';
import { BusinessSector, Prisma } from 'generated/prisma/client';
import type { ExtendedPrismaClient } from 'src/tenant-prisma.service';
import { CustomerDto } from './dto/customer.dto';
import { SortOrder } from 'src/common/enums/sort-order.enum';
import { TenantDbContext } from 'lib/tenant-db-context';

@Injectable()
export class CustomersRepository {
  constructor(
    // ✅ use `ExtendedPrismaClient` type for correct type-safety of your extended PrismaClient
    private readonly db: TenantDbContext,
  ) {}

  async findCustomerByEmail(email: string): Promise<CustomerDto> {
    const customer = await this.db.prisma.customer.findUnique({
      where: { email },
    });
    if (!customer) {
      throw new NotFoundException(`Customer with email ${email} not found`);
    }
    return transformResponse(CustomerDto, customer);
  }

  async findAllCustomers(query?: string): Promise<CreateCustomerDto[]> {
    const where: Prisma.CustomerWhereInput = {
      deleted: false,
    };

    if (query) {
      where.OR = [
        { firstName: { contains: query, mode: 'insensitive' } },
        { lastName: { contains: query, mode: 'insensitive' } },
        { email: { contains: query, mode: 'insensitive' } },
      ];
    }

    const customers = await this.db.prisma.customer.findMany({
      where,
      orderBy: { signedUp: 'desc' },
    });

    return customers.map((customer) =>
      transformResponse(CustomerDto, customer),
    );
  }

  async findCustomerByReference(
    customerReference: number,
  ): Promise<CustomerDto> {
    const customer = await this.db.prisma.customer.findUnique({
      where: { customerReference },
    });
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
    sort?: string,
    order?: SortOrder,
    search?: string | undefined,
    businessSector?: BusinessSector,
  ): Promise<CustomerPagingResultDto> {
    console.log('businessSector', businessSector);
    const [users, meta] = await this.db.prisma.customer
      .paginate({
        where: {
          ...(businessSector && { businessSector }),
          ...(search && {
            OR: [
              { firstName: { contains: search, mode: 'insensitive' } },
              { lastName: { contains: search, mode: 'insensitive' } },
              { email: { contains: search, mode: 'insensitive' } },
            ],
          }),
        },
        orderBy: {
          [sort || 'signedUp']: order,
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

    const customer = await this.db.prisma.customer.create({
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
    const originalCustomer = await this.db.prisma.customer.findUnique({
      where: { customerReference },
    });

    if (!originalCustomer) {
      throw new NotFoundException('Customer not found');
    }

    if (isNoChange<UpdateCustomerDto>(customerData, originalCustomer)) {
      throw new BadRequestException('No changes detected');
    }

    // Exclude customerId from history entry
    const { customerId, ...customerHistoryData } = originalCustomer;

    const [, updatedCustomer] = await this.db.prisma.$transaction([
      this.db.prisma.customerHistory.create({
        data: customerHistoryData,
      }),
      this.db.prisma.customer.update({
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
