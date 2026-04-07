import {
  BadRequestException,
  Inject,
  Injectable,
  NestMiddleware,
  NotFoundException,
} from '@nestjs/common';
import type {
  Request as ExpressRequest,
  Response,
  NextFunction,
} from 'express';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { Cache } from 'cache-manager';
import { TenantRepository } from 'src/tenant/tenant.repository';

export type TenantRequest = ExpressRequest & {
  tenantId?: string;
  tenantDbUrl?: string;
  subdomain?: string | null;
};

type CachedTenant = {
  tenantId: string;
  subdomain: string;
  dbUrl: string;
};

function extractTenantSubdomainFromUrl(value?: string | string[]): string | null {
  const input = Array.isArray(value) ? value[0] : value;

  if (!input) return null;

  try {
    const url = new URL(input);
    const host = url.hostname.toLowerCase();

    if (host.endsWith('.localhost')) {
      const subdomain = host.replace('.localhost', '');
      return subdomain || null;
    }

    const parts = host.split('.');
    if (parts.length >= 4) {
      return parts[0] || null;
    }

    return null;
  } catch {
    return null;
  }
}

@Injectable()
export class TenantMiddleware implements NestMiddleware {
  constructor(
    @Inject(CACHE_MANAGER) private readonly cache: Cache,
    private readonly tenantRepository: TenantRepository,
  ) {}

  async use(req: TenantRequest, res: Response, next: NextFunction) {
    try {
      const host = req.headers.host?.split(':')[0] ?? '';
      const forwardedTenant = req.headers['x-tenant-subdomain']
        ?.toString()
        .trim()
        .toLowerCase();
      const origin = req.headers.origin;
      const referer = req.headers.referer;

      let subdomain: string | null = null;

      if (forwardedTenant) {
        subdomain = forwardedTenant;
      } else {
        subdomain =
          extractTenantSubdomainFromUrl(origin) ??
          extractTenantSubdomainFromUrl(referer);

        if (!subdomain) {
          if (host.endsWith('.localhost')) {
            subdomain = host.replace('.localhost', '');
          } else {
            const parts = host.split('.');
            if (parts.length >= 4) {
              subdomain = parts[0];
            }
          }
        }
      }

      console.log(`Incoming request: ${req.method} ${req.originalUrl}`);
      console.log(`Host: ${host}`);
      console.log(`x-tenant-subdomain: ${forwardedTenant ?? 'missing'}`);
      console.log(`Origin: ${origin ?? 'missing'}`);
      console.log(`Referer: ${referer ?? 'missing'}`);
      console.log(`Resolved subdomain: ${subdomain}`);

      if (!subdomain) {
        throw new BadRequestException('Missing tenant subdomain');
      }

      if (!/^[a-zA-Z0-9_-]{3,50}$/.test(subdomain)) {
        throw new BadRequestException('Invalid tenant subdomain');
      }

      const cacheKey = `tenant:subdomain:${subdomain}`;

      let tenant = await this.cache.get<CachedTenant>(cacheKey);

      if (!tenant) {
        const dbTenant = await this.tenantRepository.getBySubdomain(subdomain);

        if (!dbTenant) {
          throw new NotFoundException(
            `Tenant not found for subdomain: ${subdomain}`,
          );
        }

        tenant = {
          tenantId: dbTenant.tenantId,
          subdomain: dbTenant.subdomain,
          dbUrl: dbTenant.dbUrl,
        };

        await this.cache.set(cacheKey, tenant, 60 * 60 * 1000);
      }

      req.subdomain = tenant.subdomain;
      req.tenantId = tenant.tenantId;
      req.tenantDbUrl = tenant.dbUrl;

      console.log(`Resolved tenantId: ${req.tenantId}`);
      console.log(`Resolved tenantDbUrl: ${req.tenantDbUrl}`);

      next();
    } catch (error) {
      next(error);
    }
  }
}
