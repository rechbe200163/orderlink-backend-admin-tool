import { Injectable } from '@nestjs/common';
import { AddressesRepository } from './addresses.repository';
import { CreateAddressDto } from 'prisma/src/generated/dto/create-address.dto';
import { UpdateAddressDto } from 'prisma/src/generated/dto/update-address.dto';
import { PagingResultDto } from 'lib/dto/genericPagingResultDto';
import { AddressDto } from 'prisma/src/generated/dto/address.dto';

@Injectable()
export class AddressesService {
  constructor(private readonly addressesRepository: AddressesRepository) {}

  create(
    tenantId: string,
    createAddressDto: CreateAddressDto,
  ): Promise<AddressDto> {
    return this.addressesRepository.create(tenantId, createAddressDto);
  }

  findAllPaging(
    tenantId: string,
    limit = 10,
    page = 1,
    query?: string,
  ): Promise<PagingResultDto<AddressDto>> {
    return this.addressesRepository.findAllPaging(tenantId, limit, page, query);
  }

  findAll(tenantId: string): Promise<AddressDto[]> {
    return this.addressesRepository.findAll(tenantId);
  }

  findById(tenantId: string, id: string): Promise<AddressDto> {
    return this.addressesRepository.findById(tenantId, id);
  }

  update(
    tenantId: string,
    id: string,
    updateAddressDto: UpdateAddressDto,
  ): Promise<AddressDto> {
    return this.addressesRepository.update(tenantId, id, updateAddressDto);
  }
}
