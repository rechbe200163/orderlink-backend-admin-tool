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
  Query,
  ParseIntPipe,
  BadRequestException,
} from '@nestjs/common';
import { RolesService } from './roles.service';
import { Resource } from 'lib/decorators/resource.decorator';
import { Resources } from '../rbac/resources.enum';
import { CacheInterceptor } from '@nestjs/cache-manager';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiBody,
  ApiConflictResponse,
  ApiForbiddenResponse,
  ApiInternalServerErrorResponse,
  ApiOkResponse,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/guards/jwt.guard';
import { PermissionsGuard } from 'src/auth/guards/RBACGuard';
import { MAX_PAGE_SIZE } from 'lib/constants';
import { UpdateRoleDto } from 'prisma/src/generated/dto/update-role.dto';
import { CreateRoleDto } from 'prisma/src/generated/dto/create-role.dto';
import { RoleDto } from 'prisma/src/generated/dto/role.dto';
import { RolePagingResultDto } from './dto/role-paging';

@Controller('roles')
@UseInterceptors(CacheInterceptor)
@Resource(Resources.ROLE)
@ApiInternalServerErrorResponse({
  description: 'Internal server error',
})
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PermissionsGuard)
@ApiForbiddenResponse({
  description:
    'Role does not have the permissions to perform this action on the requeseted resource',
})
export class RolesController {
  constructor(private readonly rolesService: RolesService) {}

  @Post()
  @ApiBody({
    type: CreateRoleDto,
    description: 'Create a new role',
  })
  @ApiForbiddenResponse({
    description: 'You do not have permission to create a role',
  })
  @ApiConflictResponse({
    description: 'Role with this name already exists',
  })
  @ApiOkResponse({
    description: 'Role created successfully',
    type: RoleDto,
  })
  @ApiBadRequestResponse({
    description: 'Role with this name already exists or invalid data provided',
  })
  create(@Body() createRoleDto: CreateRoleDto) {
    return this.rolesService.create(createRoleDto);
  }

  @Get()
  @ApiQuery({
    name: 'limit',
    description: 'Number of roles to return per page',
    type: Number,
    default: 10,
    required: true,
    maximum: MAX_PAGE_SIZE,
    example: 10,
  })
  @ApiQuery({
    name: 'page',
    description: 'Page number to return',
    type: Number,
    default: 1,
    required: true,
    example: 1,
  })
  @ApiQuery({
    name: 'search',
    description: 'Search query for role name or description',
    type: String,
    required: false,
    example: 'admin',
  })
  @ApiOkResponse({ type: RolePagingResultDto })
  findAll(
    @Query('limit', ParseIntPipe) limit: number = 10,
    @Query('page', ParseIntPipe) page: number = 1,
    @Query('search') search?: string,
  ) {
    if (limit > MAX_PAGE_SIZE) {
      throw new BadRequestException(`Limit cannot exceed ${MAX_PAGE_SIZE}`);
    }
    return this.rolesService.findAll(limit, page, search);
  }

  @Get('roleNames')
  @ApiOkResponse({
    description: 'All role names retrieved successfully',
    type: [String],
  })
  findAllRoleNames() {
    return this.rolesService.findAllRoleNames();
  }

  @Get(':name')
  @ApiParam({
    name: 'name',
    description: 'Name of the role to retrieve',
    type: String,
    required: true,
    example: 'ADMIN',
  })
  @ApiOkResponse({
    description: 'Role retrieved successfully',
    type: RoleDto,
  })
  findOne(@Param('name') name: string) {
    return this.rolesService.findOne(name);
  }

  @Patch(':name')
  @ApiParam({
    name: 'name',
    description: 'Name of the role to update',
    type: String,
    required: true,
    example: 'ADMIN',
  })
  @ApiBody({
    type: UpdateRoleDto,
    description: 'Update an existing role',
  })
  update(@Param('name') name: string, @Body() updateRoleDto: UpdateRoleDto) {
    return this.rolesService.update(name, updateRoleDto);
  }
}
