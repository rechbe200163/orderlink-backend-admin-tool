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
import { SiteConfigService } from './site-config.service';
import { ResourceCacheInterceptor } from '../cache/resource-cache.interceptor';
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
import { CreateSiteConfigDto } from 'prisma/src/generated/dto/create-siteConfig.dto';
import { UpdateSiteConfigDto } from 'prisma/src/generated/dto/update-siteConfig.dto';
import { SiteConfigDto } from 'prisma/src/generated/dto/siteConfig.dto';
import { PagingResultDto } from 'lib/dto/genericPagingResultDto';
import { MAX_PAGE_SIZE } from 'lib/constants';

@Controller('site-config')
@UseInterceptors(ResourceCacheInterceptor)
@Resource(Resources.SITE_CONFIG)
@ApiInternalServerErrorResponse({ description: 'Internal server error' })
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PermissionsGuard)
@ApiForbiddenResponse({
  description:
    'Role does not have the permissions to perform this action on the requested resource',
})
export class SiteConfigController {
  constructor(private readonly siteConfigService: SiteConfigService) {}

  @Post()
  @ApiBody({ type: CreateSiteConfigDto })
  @ApiOkResponse({ type: SiteConfigDto })
  create(@Body() createDto: CreateSiteConfigDto) {
    return this.siteConfigService.create(createDto);
  }

  @Get()
  @ApiOkResponse({ type: SiteConfigDto })
  findAll() {
    return this.siteConfigService.findFirst();
  }

  @Get(':id')
  @ApiParam({ name: 'id', type: String })
  @ApiOkResponse({ type: SiteConfigDto })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.siteConfigService.findById(id);
  }

  @Patch(':id')
  @ApiParam({ name: 'id', type: String })
  @ApiBody({ type: UpdateSiteConfigDto })
  @ApiOkResponse({ type: SiteConfigDto })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateDto: UpdateSiteConfigDto,
  ) {
    return this.siteConfigService.update(id, updateDto);
  }
}
