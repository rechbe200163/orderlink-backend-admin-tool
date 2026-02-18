import { SetMetadata } from '@nestjs/common';
export const RESOURCE_KEY = 'resource'; // <-- Konstanter Schlüssel

type ResourceType = 'ADDRESSES' | 'USERS' | 'ROLES'; // <-- Definieren Sie den Typ für Ressourcen

export const Resource = (resource: string) =>
  SetMetadata(RESOURCE_KEY, resource);
