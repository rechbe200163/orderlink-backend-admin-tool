import { CacheInterceptor } from '@nestjs/cache-manager';
import { ExecutionContext, Injectable } from '@nestjs/common';
import { Request } from 'express';

@Injectable()
export class HttpCacheInterceptor extends CacheInterceptor {
  trackBy(context: ExecutionContext): string | undefined {
    const request = context.switchToHttp().getRequest<Request>();

    // Nur GET Requests cachen
    if (request.method !== 'GET') {
      return undefined;
    }

    const tenantId = (request as any).tenantId; // aus deinem Middleware
    if (!tenantId) {
      return undefined;
    }

    const url = request.originalUrl;

    return `tenant:${tenantId}:url:${url}`;
  }
}
