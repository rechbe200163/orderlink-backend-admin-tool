import { CACHE_MANAGER } from '@nestjs/cache-manager';
import {
  CallHandler,
  ExecutionContext,
  Inject,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import type { Cache } from 'cache-manager';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable()
export class CacheInvalidationInterceptor implements NestInterceptor {
  constructor(@Inject(CACHE_MANAGER) private cacheManager: Cache) {}

  async intercept(context: ExecutionContext, next: CallHandler): Promise<Observable<any>> {
    const request = context.switchToHttp().getRequest();
    const method = request.method;

    if (!['POST', 'PATCH'].includes(method)) {
      return next.handle();
    }

    const url: string = request.baseUrl || request.url || '';
    const resource = url.split('/').filter(Boolean)[0];

    return next.handle().pipe(
      tap(async () => {
        try {
          const store: any = (this.cacheManager as any).store;
          const keys: string[] = (await store.keys()) as string[];
          const matched = keys.filter((key) =>
            key.includes(`/${resource}`),
          );
          await Promise.all(matched.map((key) => this.cacheManager.del(key)));
        } catch (err) {
          console.error('Cache invalidation failed', err);
        }
      }),
    );
  }
}
