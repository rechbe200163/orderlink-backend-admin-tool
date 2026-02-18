import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseInterceptors,
  UseGuards,
} from '@nestjs/common';
import { ActionsService } from './actions.service';
import { CreateActionDto } from './dto/create-action.dto';
import { UpdateActionDto } from './dto/update-action.dto';
import { Resource } from 'lib/decorators/resource.decorator';
import { CacheInterceptor } from '@nestjs/cache-manager';
import { JwtAuthGuard } from 'src/auth/guards/jwt.guard';
import { PermissionsGuard } from 'src/auth/guards/RBACGuard';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConflictResponse,
  ApiForbiddenResponse,
  ApiInternalServerErrorResponse,
  ApiOkResponse,
} from '@nestjs/swagger';

@Controller('actions')
@UseInterceptors(CacheInterceptor)
@Resource('ACTIONS')
@ApiInternalServerErrorResponse({
  description: 'Internal server error',
})
@ApiBearerAuth()
@ApiForbiddenResponse({
  description:
    'Role does not have the permissions to perform this action on the requeseted resource',
})
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class ActionsController {
  constructor(private readonly actionsService: ActionsService) {}

  @Post()
  @ApiOkResponse({
    description: 'Action created successfully',
    type: CreateActionDto,
  })
  @ApiBody({
    type: CreateActionDto,
    description: 'The action to create',
  })
  @ApiConflictResponse({
    description: 'An action with this key already exists',
  })
  create(@Body() createActionDto: CreateActionDto) {
    return this.actionsService.create(createActionDto);
  }

  @Get()
  @ApiOkResponse({
    description: 'Returns all actions',
  })
  findAll(
    @Param('limit') limit: number = 10,
    @Param('page') page: number = 1,
    @Param('search') search: string = '',
  ) {
    return this.actionsService.findAll(limit, page, search);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.actionsService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateActionDto: UpdateActionDto) {
    return this.actionsService.update(id, updateActionDto);
  }
}
