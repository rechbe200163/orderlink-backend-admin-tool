import { UnauthorizedException } from '@nestjs/common';
import { SanitizedEmployee } from 'lib/types';

export function requireTenantId(req: any): SanitizedEmployee {
  const tid = req?.user;
  if (!tid) throw new UnauthorizedException('Missing tenantId in JWT');
  return tid;
}
