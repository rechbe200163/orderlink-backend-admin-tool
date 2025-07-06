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
import { CacheInterceptor } from '@nestjs/cache-manager';
import { Ressources } from '@prisma/client';
import { Resource } from 'lib/decorators/ressource-decorator';
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
@UseInterceptors(CacheInterceptor)
@Resource(Ressources.SITE_CONFIG)
@ApiInternalServerErrorResponse({ description: 'Internal server error' })
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PermissionsGuard)
@ApiForbiddenResponse({
  description:
    'Role does not have the permissions to perform this action on the requested ressource',
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
  @ApiQuery({ name: 'limit', type: Number, required: false, default: 10, maximum: MAX_PAGE_SIZE })
  @ApiQuery({ name: 'page', type: Number, required: false, default: 1 })
  @ApiOkResponse({ type: PagingResultDto<SiteConfigDto> })
  findAll(
    @Query('limit', ParseIntPipe) limit = 10,
    @Query('page', ParseIntPipe) page = 1,
  ) {
    if (limit > MAX_PAGE_SIZE) {
      throw new BadRequestException(`Limit cannot exceed ${MAX_PAGE_SIZE}`);
    }
    return this.siteConfigService.findAll(limit, page);
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
