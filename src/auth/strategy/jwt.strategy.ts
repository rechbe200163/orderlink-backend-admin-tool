import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { JwtPayload, UserRequest } from 'lib/types';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(config: ConfigService) {
    const jwtSecret = config.getOrThrow<string>('JWT_SECRET');
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: jwtSecret,
      passReqToCallback: true,
    });
  }

  async validate(req: UserRequest, payload: JwtPayload) {
    // 1. JWT must contain tenantId

    // 2. Request must contain tenantId (set by TenantMiddleware)
    if (!req.tenantId) {
      throw new UnauthorizedException('Tenant not resolved');
    }

    // 4. Attach tenantId to request for later use
    return payload;
  }
}
