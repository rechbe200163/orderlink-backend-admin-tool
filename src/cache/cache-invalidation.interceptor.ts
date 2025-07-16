import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Reflector } from '@nestjs/core';
import { CacheInvalidationService } from './cache-invalidation.service';
import { RESOURCE_KEY } from 'lib/decorators/resource.decorator';

@Injectable()
export class CacheInvalidationInterceptor implements NestInterceptor {
  constructor(
    private readonly reflector: Reflector,
    private readonly invalidation: CacheInvalidationService,
  ) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      tap(() => {
        const request = context.switchToHttp().getRequest();
        if (['POST', 'PATCH'].includes(request.method)) {
          const resource = this.reflector.getAllAndOverride<string>(RESOURCE_KEY, [
            context.getHandler(),
            context.getClass(),
          ]);
          if (resource) {
            this.invalidation.invalidateResource(resource);
          }
        }
      }),
    );
  }
}
