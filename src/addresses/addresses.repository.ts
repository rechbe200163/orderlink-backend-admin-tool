import { BadRequestException, Inject, Injectable, NotFoundException } from '@nestjs/common';
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

  async create(data: CreateAddressDto): Promise<AddressDto> {
    const address = await this.prismaService.client.address.create({ data });
    return transformResponse(AddressDto, address);
  }

  async findAll(limit = 10, page = 1): Promise<PagingResultDto<AddressDto>> {
    const [addresses, meta] = await this.prismaService.client.address
      .paginate({ where: { deleted: false } })
      .withPages({ limit, page, includePageCount: true });

    return {
      data: addresses.map((a: AddressDto) => transformResponse(AddressDto, a)),
      meta,
    };
  }

  async findById(addressId: string): Promise<AddressDto> {
    const address = await this.prismaService.client.address.findUnique({
      where: { addressId },
    });
    if (!address) {
      throw new NotFoundException(`Address with ID ${addressId} not found`);
    }
    return transformResponse(AddressDto, address);
  }

  async update(addressId: string, data: UpdateAddressDto): Promise<AddressDto> {
    const existing = await this.prismaService.client.address.findUnique({
      where: { addressId },
    });
    if (!existing) {
      throw new NotFoundException(`Address with ID ${addressId} not found`);
    }
    if (isNoChange<UpdateAddressDto>(data, existing)) {
      throw new BadRequestException(`No changes detected for address ${addressId}`);
    }
    const address = await this.prismaService.client.address.update({
      where: { addressId },
      data,
    });
    return transformResponse(AddressDto, address);
  }
}
