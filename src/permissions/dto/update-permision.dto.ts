import { PartialType } from '@nestjs/swagger';
import { CreatePermissionsDto } from './create-permision.dto';

export class UpdatePermissionDto extends PartialType(CreatePermissionsDto) {}
