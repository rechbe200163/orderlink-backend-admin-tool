import { Injectable } from '@nestjs/common';
import { CreateActionDto } from './dto/create-action.dto';
import { UpdateActionDto } from './dto/update-action.dto';
import { ActionsRepository } from './actions.repository';

@Injectable()
export class ActionsService {
  constructor(private readonly repo: ActionsRepository) {}

  create(createActionDto: CreateActionDto) {
    return this.repo.create(createActionDto);
  }

  findAll(limit: number = 10, page: number = 1, search: string = '') {
    return this.repo.findAll(limit, page, search);
  }

  findOne(id: string) {
    return this.repo.findById(id);
  }

  update(id: string, updateActionDto: UpdateActionDto) {
    return this.repo.update(id, updateActionDto);
  }
}
