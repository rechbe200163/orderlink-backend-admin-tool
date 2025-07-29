import { Module } from '@nestjs/common';
import { Expose } from 'class-transformer';
import { IsString, IsNotEmpty, IsDate, IsEnum } from 'class-validator';

enum ModuleEnum {
  CUSTOM_ROLES = 'CUSTOM_ROLES',
  STATISTICS = 'STATISTICS',
  NAVIGATION = 'NAVIGATION',
}

export class EnabledModuleDto {
  @Expose()
  @IsString()
  @IsNotEmpty()
  id: string;

  @Expose()
  @IsString()
  @IsNotEmpty()
  tenantId: string;

  @Expose()
  @IsEnum(ModuleEnum)
  moduleName: ModuleEnum;

  @Expose()
  @IsDate()
  enabledAt: Date;
}
