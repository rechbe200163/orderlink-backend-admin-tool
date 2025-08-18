import { SetMetadata } from '@nestjs/common';
import { ModuleEnum } from '@prisma/client';

export const MODULE_KEY = 'module'; // <-- Konstanter Schlüssel

export const ModuleTag = (module: ModuleEnum) =>
  SetMetadata(MODULE_KEY, module);
