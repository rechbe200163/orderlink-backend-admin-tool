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
  Module,
  Req,
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
import { ModulesGuard } from 'src/auth/guards/modules.guard';
import { ModuleTag } from 'lib/decorators/module.decorators';
import { ModuleEnum } from 'src/site-config/dto/modules-entity.dto';
import { requireTenantId } from 'lib/common/tenant.util';

@Controller('routes')
@UseInterceptors(CacheInterceptor)
@ModuleTag(ModuleEnum.NAVIGATION)
@Resource(Resources.ROUTES)
@ApiInternalServerErrorResponse({ description: 'Internal server error' })
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PermissionsGuard, ModulesGuard)
@ApiForbiddenResponse({
  description:
    'Role does not have the permissions to perform this action on the requested resource',
})
export class RoutesController {
  constructor(private readonly routesService: RoutesService) {}

  @Post()
  @ApiBody({ type: CreateRouteDto })
  @ApiOkResponse({ type: RouteDto })
  create(@Req() req, @Body() createRouteDto: CreateRouteDto) {
    const { tenantId } = requireTenantId(req);
    return this.routesService.create(tenantId, createRouteDto);
  }

  @Get()
  @ApiQuery({
    name: 'limit',
    type: Number,
    required: false,
    default: 10,
    maximum: MAX_PAGE_SIZE,
  })
  @ApiQuery({ name: 'page', type: Number, required: false, default: 1 })
  @ApiQuery({ name: 'search', type: String, required: false })
  @ApiOkResponse({
    type: PagingResultDto<RouteDto & { ordersCount: number }>,
    isArray: false,
    description: 'Returns a paginated list of routes',
  })
  async findAll(
    @Req() req,
    @Query('limit', ParseIntPipe) limit = 10,
    @Query('page', ParseIntPipe) page = 1,
    @Query('search') search?: string,
  ) {
    const { tenantId } = requireTenantId(req);

    if (limit > MAX_PAGE_SIZE) {
      throw new BadRequestException(`Limit cannot exceed ${MAX_PAGE_SIZE}`);
    }
    return this.routesService.findAll(tenantId, limit, page, search);
  }

  @Get(':routeId')
  @ApiParam({ name: 'routeId', type: String })
  @ApiOkResponse({ type: RouteDto })
  findOne(@Req() req, @Param('routeId', ParseUUIDPipe) routeId: string) {
    const { tenantId } = requireTenantId(req);

    return this.routesService.findById(tenantId, routeId);
  }

  @Patch(':routeId')
  @ApiParam({ name: 'routeId', type: String })
  @ApiBody({ type: UpdateRouteDto })
  @ApiOkResponse({ type: RouteDto })
  update(
    @Req() req,
    @Param('routeId', ParseUUIDPipe) routeId: string,
    @Body() updateRouteDto: UpdateRouteDto,
  ) {
    const { tenantId } = requireTenantId(req);

    return this.routesService.update(tenantId, routeId, updateRouteDto);
  }
}
