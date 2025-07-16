import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Inject, Injectable } from '@nestjs/common';
import { Cache } from 'cache-manager';

@Injectable()
export class CacheInvalidationService {
  private readonly resourceKeys = new Map<string, Set<string>>();

  constructor(@Inject(CACHE_MANAGER) private readonly cache: Cache) {}

  registerKey(resource: string, key: string) {
    if (!this.resourceKeys.has(resource)) {
      this.resourceKeys.set(resource, new Set());
    }
    this.resourceKeys.get(resource)!.add(key);
  }

  async invalidateResource(resource: string) {
    const keys = this.resourceKeys.get(resource);
    if (!keys) return;
    for (const key of keys) {
      await this.cache.del(key);
    }
    this.resourceKeys.delete(resource);
  }
}
