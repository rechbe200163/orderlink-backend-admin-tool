import { Injectable } from '@nestjs/common';
import { AddressesRepository } from './addresses.repository';
import { CreateAddressDto } from 'prisma/src/generated/dto/create-address.dto';
import { UpdateAddressDto } from 'prisma/src/generated/dto/update-address.dto';
import { PagingResultDto } from 'lib/dto/genericPagingResultDto';
import { AddressDto } from 'prisma/src/generated/dto/address.dto';

const geocoding = require('@aashari/nodejs-geocoding');

@Injectable()
export class AddressesService {
  constructor(private readonly addressesRepository: AddressesRepository) {}

  async create(createAddressDto: CreateAddressDto): Promise<AddressDto> {
    let latitude_db: number | null = null;
    let longitude_db: number | null = null;
    
    const fullAddress = `${createAddressDto.streetNumber} ${createAddressDto.streetName}, ${createAddressDto.city}, ${createAddressDto.state}, ${createAddressDto.postCode}, ${createAddressDto.country}`;
    try {
      const location = (await geocoding.encode(fullAddress)) as Array<{ latitude: number; longitude: number }>;
      if (location && location.length > 0) {
        const { latitude, longitude } = location[0];
        latitude_db = latitude;
        longitude_db = longitude;
      }
    } catch (err: unknown) {
      console.error('Geocoding error:', err);
    }
    const dbAddress = {
      city: createAddressDto.city,
      country: createAddressDto.country,
      postCode: createAddressDto.postCode,
      state: createAddressDto.state,
      streetName: createAddressDto.streetName,
      streetNumber: createAddressDto.streetNumber,
      latitude: latitude_db,
      longitude: longitude_db
    };
    console.log('Creating address with data:', dbAddress);
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
