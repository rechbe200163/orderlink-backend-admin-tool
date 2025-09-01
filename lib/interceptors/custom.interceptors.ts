import { Injectable, Inject } from '@nestjs/common';
import { Cache } from 'cache-manager';
import { CallHandler, ExecutionContext, NestInterceptor } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Resources } from '@prisma/client';
import { RESOURCE_KEY } from 'lib/decorators/resource.decorator';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
@Injectable()
export class CustomInterceptors implements NestInterceptor {
  constructor(
    @Inject(CACHE_MANAGER) private cacheManager: Cache, // <-- CacheManager reinziehen
    private reflector: Reflector,
  ) {}

  async intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Promise<Observable<any>> {
    const request = context.switchToHttp().getRequest();
    const startTime = Date.now();
    const res = this.reflector.getAllAndOverride<Resources>(RESOURCE_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    // if (['POST', 'DELETE', 'PATCH', 'PUT'].includes(request.method)) {
    //   this.cacheManager.clear(); // <-- Cache leeren
    // }

    return next.handle().pipe(
      tap((response) => {
        const responseTime = Date.now() - startTime;
        console.log({
          method: request.method,
          url: request.url,
          statusCode: response?.statusCode,
          responseTime: `${responseTime}ms`,
          data: response?.data,
        });
      }),
    );
  }
}
