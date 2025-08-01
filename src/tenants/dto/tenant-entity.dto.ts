import { Exclude, Expose } from 'class-transformer';
import {
  IsDate,
  IsEnum,
  IsNumber,
  IsPositive,
  IsString,
  IsUUID,
} from 'class-validator';
import { EnabledModuleDto } from './modules-entity.dto';

export class TenantDto {
  @Exclude()
  @IsUUID()
  tenantId: string;

  @Exclude()
  @IsString()
  companyName: string;

  @Exclude()
  @IsString()
  slug: string;

  @Exclude()
  @IsString()
  backendUrl: string;

  @Expose()
  @IsEnum(['active', 'inactive', 'trialing', 'suspended'] as const)
  status: string;

  @Expose()
  @IsDate()
  trialStartedAt: Date;

  @Expose()
  @IsDate()
  trialEndsAt: Date;

  @Expose()
  @IsNumber()
  @IsPositive()
  maxEmployees: number;

  @Expose()
  @IsNumber()
  @IsPositive()
  enabledModules: EnabledModuleDto[];

  @Expose()
  @IsString()
  billingCustomerId: string;

  @Exclude()
  @IsDate()
  createdAt: Date;

  @Exclude()
  @IsDate()
  updatedAt: Date;
}
