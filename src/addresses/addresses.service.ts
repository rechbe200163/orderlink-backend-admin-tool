import { Injectable } from '@nestjs/common';
import { AddressesRepository } from './addresses.repository';
import { CreateAddressDto } from 'prisma/src/generated/dto/create-address.dto';
import { UpdateAddressDto } from 'prisma/src/generated/dto/update-address.dto';
import { PagingResultDto } from 'lib/dto/genericPagingResultDto';
import { AddressDto } from 'prisma/src/generated/dto/address.dto';

@Injectable()
export class AddressesService {
  constructor(private readonly addressesRepository: AddressesRepository) {}

  create(createAddressDto: CreateAddressDto): Promise<AddressDto> {
    return this.addressesRepository.create(createAddressDto);
  }

  findAll(limit = 10, page = 1): Promise<PagingResultDto<AddressDto>> {
    return this.addressesRepository.findAll(limit, page);
  }

  findById(id: string): Promise<AddressDto> {
    return this.addressesRepository.findById(id);
  }

  update(id: string, updateAddressDto: UpdateAddressDto): Promise<AddressDto> {
    return this.addressesRepository.update(id, updateAddressDto);
  }
}
