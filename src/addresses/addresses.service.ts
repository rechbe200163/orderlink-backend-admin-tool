import { Injectable } from '@nestjs/common';
import { AddressesRepository } from './addresses.repository';
import { CreateAddressDto } from 'prisma/src/generated/dto/create-address.dto';
import { UpdateAddressDto } from 'prisma/src/generated/dto/update-address.dto';
import { PagingResultDto } from 'lib/dto/genericPagingResultDto';
import { AddressDto } from 'prisma/src/generated/dto/address.dto';
import { getCoordinatesFromAddress } from './helpers/coordinatesFromAddress';

@Injectable()
export class AddressesService {
  constructor(private readonly addressesRepository: AddressesRepository) {}

  async create(createAddressDto: CreateAddressDto): Promise<AddressDto> {
    const fullAddress = `${createAddressDto.streetNumber} ${createAddressDto.streetName}, ${createAddressDto.city}, ${createAddressDto.state}, ${createAddressDto.postCode}, ${createAddressDto.country}`;

    const { latitude, longitude } = await getCoordinatesFromAddress(fullAddress);

    const dbAddress = {
      city: createAddressDto.city,
      country: createAddressDto.country,
      postCode: createAddressDto.postCode,
      state: createAddressDto.state,
      streetName: createAddressDto.streetName,
      streetNumber: createAddressDto.streetNumber,
      latitude: latitude,
      longitude: longitude
    };
    return await this.addressesRepository.create(dbAddress);
  }

  findAllPaging(
    limit = 10,
    page = 1,
    query?: string,
  ): Promise<PagingResultDto<AddressDto>> {
    return this.addressesRepository.findAllPaging(limit, page, query);
  }

  findAll(): Promise<AddressDto[]> {
    return this.addressesRepository.findAll();
  }

  findById(id: string): Promise<AddressDto> {
    return this.addressesRepository.findById(id);
  }

  update(id: string, updateAddressDto: UpdateAddressDto): Promise<AddressDto> {
    return this.addressesRepository.update(id, updateAddressDto);
  }
}
