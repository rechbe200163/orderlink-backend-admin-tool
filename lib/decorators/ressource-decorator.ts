import { SetMetadata } from '@nestjs/common';
import { Ressources } from '@prisma/client';

export const RESOURCE_KEY = 'resource'; // <-- Konstanter Schlüssel

export const Resource = (resource: Ressources) =>
  SetMetadata(RESOURCE_KEY, resource);
