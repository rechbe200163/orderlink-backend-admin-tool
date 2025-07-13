import { SetMetadata } from '@nestjs/common';
import { Resources } from '@prisma/client';

export const RESOURCE_KEY = 'resource'; // <-- Konstanter Schlüssel

export const Resource = (resource: Resources) =>
  SetMetadata(RESOURCE_KEY, resource);
