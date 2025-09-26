import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CustomPrismaService } from 'nestjs-prisma';
import { ExtendedPrismaClient } from 'prisma/prisma.extension';
import { CreateAddressDto } from 'prisma/src/generated/dto/create-address.dto';
import { AddressDto } from 'prisma/src/generated/dto/address.dto';
import { UpdateAddressDto } from 'prisma/src/generated/dto/update-address.dto';
import { PagingResultDto } from 'lib/dto/genericPagingResultDto';
import { transformResponse } from 'lib/utils/transform';
import { isNoChange } from 'lib/utils/isNoChange';

@Injectable()
export class AddressesRepository {
  constructor(
    @Inject('PrismaService')
    private prismaService: CustomPrismaService<ExtendedPrismaClient>,
  ) {}

  async create(tenantId: string, data: CreateAddressDto): Promise<AddressDto> {
    const address = await this.prismaService.client.address.create({
      data: {
        ...data,
        tenantId,
      },
    });
    return transformResponse(AddressDto, address);
  }

  async findAllPaging(
    tenantId: string,
    limit = 10,
    page = 1,
    query?: string,
  ): Promise<PagingResultDto<AddressDto>> {
    const [addresses, meta] = await this.prismaService.client.address
      .paginate({
        where: {
          tenantId,
          deleted: false,
          ...(query && {
            OR: [
              { streetName: { contains: query, mode: 'insensitive' } },
              { city: { contains: query, mode: 'insensitive' } },
            ],
          }),
        },
      })
      .withPages({ limit, page, includePageCount: true });

    return {
      data: addresses.map((a: AddressDto) => transformResponse(AddressDto, a)),
      meta,
    };
  }

  async findAll(tenantId: string): Promise<AddressDto[]> {
    const addresses = await this.prismaService.client.address.findMany({
      where: { deleted: false, tenantId },
    });
    return addresses.map((a: AddressDto) => transformResponse(AddressDto, a));
  }

  async findById(tenantId: string, addressId: string): Promise<AddressDto> {
    const address = await this.prismaService.client.address.findUnique({
      where: {
        tenantId_addressId: {
          tenantId,
          addressId,
        },
      },
    });
    if (!address) {
      throw new NotFoundException(`Address with ID ${addressId} not found`);
    }
    return transformResponse(AddressDto, address);
  }

  async update(
    tenantId: string,
    addressId: string,
    data: UpdateAddressDto,
  ): Promise<AddressDto> {
    const existing = await this.prismaService.client.address.findUnique({
      where: {
        tenantId_addressId: {
          tenantId,
          addressId,
        },
      },
    });
    if (!existing) {
      throw new NotFoundException(`Address with ID ${addressId} not found`);
    }
    if (isNoChange<UpdateAddressDto>(data, existing)) {
      throw new BadRequestException(
        `No changes detected for address ${addressId}`,
      );
    }
    const address = await this.prismaService.client.address.update({
      where: {
        tenantId_addressId: {
          tenantId,
          addressId,
        },
      },
      data,
    });
    return transformResponse(AddressDto, address);
  }
}
