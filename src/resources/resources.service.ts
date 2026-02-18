import { Injectable } from '@nestjs/common';
import { CreateResourceDto } from './dto/create-resource.dto';
import { UpdateResourceDto } from './dto/update-resource.dto';
import { ResourceRepository } from './resources.repository';

@Injectable()
export class ResourcesService {
  constructor(private readonly resourceRepository: ResourceRepository) {}
  create(createResourceDto: CreateResourceDto) {
    return this.resourceRepository.create(createResourceDto);
  }

  findAll() {
    return this.resourceRepository.findAll();
  }

  findOne(id: string) {
    return this.resourceRepository.findById(id);
  }

  update(id: string, updateResourceDto: UpdateResourceDto) {
    return this.resourceRepository.update(id, updateResourceDto);
  }
}
