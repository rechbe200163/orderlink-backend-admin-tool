import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  ParseUUIDPipe,
  UseInterceptors,
  UseGuards,
  UploadedFile,
} from '@nestjs/common';
import { SiteConfigService } from './site-config.service';
import { CacheInterceptor } from '@nestjs/cache-manager';
import { Resources } from '../rbac/resources.enum';
import { Resource } from 'lib/decorators/resource.decorator';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiForbiddenResponse,
  ApiInternalServerErrorResponse,
  ApiOkResponse,
  ApiParam,
} from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/guards/jwt.guard';
import { PermissionsGuard } from 'src/auth/guards/RBACGuard';
import { CreateSiteConfigDto } from 'prisma/src/generated/dto/create-siteConfig.dto';
import { UpdateSiteConfigDto } from 'prisma/src/generated/dto/update-siteConfig.dto';
import { SiteConfigDto } from 'prisma/src/generated/dto/siteConfig.dto';
import { FileInterceptor } from '@nestjs/platform-express';

@Controller('site-config')
@UseInterceptors(CacheInterceptor)
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
  @ApiConsumes('multipart/form-data')
  @ApiBody({ type: CreateSiteConfigDto })
  @ApiOkResponse({ type: SiteConfigDto })
  @UseInterceptors(FileInterceptor('logoPath'))
  create(
    @Body() createDto: CreateSiteConfigDto,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.siteConfigService.create(createDto, file);
  }

  @Get()
  @ApiOkResponse({ type: SiteConfigDto })
  findAll() {
    return this.siteConfigService.findFirst();
  }

  @Get(':siteConfigId')
  @ApiParam({ name: 'siteConfigId', type: String })
  @ApiOkResponse({ type: SiteConfigDto })
  findOne(@Param('siteConfigId', ParseUUIDPipe) siteConfigId: string) {
    return this.siteConfigService.findById(siteConfigId);
  }

  @Patch(':siteConfigId')
  @ApiConsumes('multipart/form-data')
  @ApiParam({ name: 'siteConfigId', type: String })
  @ApiBody({ type: UpdateSiteConfigDto })
  @ApiOkResponse({ type: SiteConfigDto })
  @UseInterceptors(FileInterceptor('logo'))
  update(
    @Param('siteConfigId', ParseUUIDPipe) siteConfigId: string,
    @Body() updateDto: UpdateSiteConfigDto,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.siteConfigService.update(siteConfigId, updateDto, file);
  }
}
