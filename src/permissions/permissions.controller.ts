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
  ParseUUIDPipe,
  Query,
  ParseIntPipe,
  BadRequestException,
} from '@nestjs/common';
import { PermissionsService } from './permissions.service';
import { CacheInterceptor } from '@nestjs/cache-manager';
import { Resource } from 'lib/decorators/ressource-decorator';
import { Ressources } from '@prisma/client';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiBody,
  ApiConflictResponse,
  ApiForbiddenResponse,
  ApiInternalServerErrorResponse,
  ApiOkResponse,
  ApiQuery,
} from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/guards/jwt.guard';
import { PermissionsGuard } from 'src/auth/guards/RBACGuard';
import { CreatePermissionDto } from 'prisma/src/generated/dto/create-permission.dto';
import { UpdatePermissionDto } from 'prisma/src/generated/dto/update-permission.dto';
import { MAX_PAGE_SIZE } from 'lib/constants';
import { PermissionPagingResultDto } from './dto/permissions-paging';

@Controller('permissions')
@UseInterceptors(CacheInterceptor)
@Resource(Ressources.PERMISSION)
@ApiInternalServerErrorResponse({
  description: 'Internal server error',
})
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PermissionsGuard)
@ApiForbiddenResponse({
  description:
    'Role does not have permission to access this resource with this action',
})
export class PermissionsController {
  constructor(private readonly permissionsService: PermissionsService) {}

  @Post()
  @ApiBody({
    type: CreatePermissionDto,
    description: 'Create a new permission',
  })
  @ApiForbiddenResponse({
    description: 'You do not have permission to create a permission',
  })
  @ApiConflictResponse({
    description: 'Permission already exists',
  })
  @ApiOkResponse({
    description: 'Permission created successfully',
    type: CreatePermissionDto,
  })
  create(@Body() createPermissionDto: CreatePermissionDto) {
    return this.permissionsService.create(createPermissionDto);
  }

  @Get()
  @ApiQuery({
    name: 'limit',
    description: 'Number of permissions to return per page',
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
    name: 'role',
    description: 'Search permissions by role',
    type: String,
    required: false,
    example: 'admin',
  })
  @ApiOkResponse({ type: PermissionPagingResultDto })
  findAll(
    @Query('limit', ParseIntPipe) limit: number = 10,
    @Query('page', ParseIntPipe) page: number = 1,
    @Query('role') role?: string,
  ) {
    if (limit > MAX_PAGE_SIZE) {
      throw new BadRequestException(`Limit cannot exceed ${MAX_PAGE_SIZE}`);
    }
    return this.permissionsService.findAll(limit, page, role);
  }

  @Get(':id')
  @ApiOkResponse({
    description: 'Permission found successfully',
    type: CreatePermissionDto,
  })
  @ApiBadRequestResponse({
    description: 'Invalid permission ID format',
  })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.permissionsService.findOne(id);
  }

  @Patch(':id')
  @ApiBody({
    type: UpdatePermissionDto,
    description: 'Update an existing permission',
  })
  @ApiBadRequestResponse({
    description: 'Invalid permission ID format',
  })
  @ApiOkResponse({
    description: 'Permission found successfully',
    type: CreatePermissionDto,
  })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updatePermissionDto: UpdatePermissionDto,
  ) {
    return this.permissionsService.update(id, updatePermissionDto);
  }
}
