import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Inject, Injectable, ExecutionContext } from '@nestjs/common';
import { CacheInterceptor } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { Reflector } from '@nestjs/core';
import { RESOURCE_KEY } from 'lib/decorators/resource.decorator';
import { CacheInvalidationService } from './cache-invalidation.service';

@Injectable()
export class ResourceCacheInterceptor extends CacheInterceptor {
  constructor(
    @Inject(CACHE_MANAGER) cacheManager: Cache,
    reflector: Reflector,
    private readonly invalidation: CacheInvalidationService,
  ) {
    super(cacheManager, reflector);
  }

  trackBy(context: ExecutionContext): string | undefined {
    const key = super.trackBy(context);
    const resource = this.reflector.getAllAndOverride<string>(RESOURCE_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (resource && key) {
      const finalKey = `${resource}:${key}`;
      this.invalidation.registerKey(resource, finalKey);
      return finalKey;
    }
    return key;
  }
}
