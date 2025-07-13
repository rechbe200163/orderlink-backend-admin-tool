import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Query,
  ParseUUIDPipe,
  ParseIntPipe,
  UseInterceptors,
  UseGuards,
  BadRequestException,
} from '@nestjs/common';
import { RoutesService } from './routes.service';
import { CacheInterceptor } from '@nestjs/cache-manager';
import { Resources } from '../rbac/resources.enum';
import { Resource } from 'lib/decorators/resource.decorator';
import {
  ApiBearerAuth,
  ApiBody,
  ApiForbiddenResponse,
  ApiInternalServerErrorResponse,
  ApiOkResponse,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/guards/jwt.guard';
import { PermissionsGuard } from 'src/auth/guards/RBACGuard';
import { CreateRouteDto } from 'prisma/src/generated/dto/create-route.dto';
import { UpdateRouteDto } from 'prisma/src/generated/dto/update-route.dto';
import { RouteDto } from 'prisma/src/generated/dto/route.dto';
import { PagingResultDto } from 'lib/dto/genericPagingResultDto';
import { MAX_PAGE_SIZE } from 'lib/constants';

@Controller('routes')
@UseInterceptors(CacheInterceptor)
@Resource(Resources.ROUTES)
@ApiInternalServerErrorResponse({ description: 'Internal server error' })
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PermissionsGuard)
@ApiForbiddenResponse({
  description:
    'Role does not have the permissions to perform this action on the requested resource',
})
export class RoutesController {
  constructor(private readonly routesService: RoutesService) {}

  @Post()
  @ApiBody({ type: CreateRouteDto })
  @ApiOkResponse({ type: RouteDto })
  create(@Body() createRouteDto: CreateRouteDto) {
    return this.routesService.create(createRouteDto);
  }

  @Get()
  @ApiQuery({ name: 'limit', type: Number, required: false, default: 10, maximum: MAX_PAGE_SIZE })
  @ApiQuery({ name: 'page', type: Number, required: false, default: 1 })
  @ApiQuery({ name: 'search', type: String, required: false })
  @ApiOkResponse({ type: PagingResultDto<RouteDto> })
  findAll(
    @Query('limit', ParseIntPipe) limit = 10,
    @Query('page', ParseIntPipe) page = 1,
    @Query('search') search?: string,
  ) {
    if (limit > MAX_PAGE_SIZE) {
      throw new BadRequestException(`Limit cannot exceed ${MAX_PAGE_SIZE}`);
    }
    return this.routesService.findAll(limit, page, search);
  }

  @Get(':id')
  @ApiParam({ name: 'id', type: String })
  @ApiOkResponse({ type: RouteDto })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.routesService.findById(id);
  }

  @Patch(':id')
  @ApiParam({ name: 'id', type: String })
  @ApiBody({ type: UpdateRouteDto })
  @ApiOkResponse({ type: RouteDto })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateRouteDto: UpdateRouteDto,
  ) {
    return this.routesService.update(id, updateRouteDto);
  }
}
