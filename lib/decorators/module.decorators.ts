import { SetMetadata } from '@nestjs/common';
import { ModuleEnum } from 'src/tenants/dto/modules-entity.dto';

export const MODULE_KEY = 'module'; // <-- Konstanter Schlüssel

export const ModuleTag = (module: ModuleEnum) =>
  SetMetadata(MODULE_KEY, module);
