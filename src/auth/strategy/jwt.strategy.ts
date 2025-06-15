import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { SanitizedCustomer } from 'lib/types';
import { ExtractJwt, Strategy } from 'passport-jwt';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    if (!process.env.JWT_SECRET) {
      throw new Error('JWT_SECRET environment variable is not defined');
    }
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET,
    });
  }

  validate(payload: SanitizedCustomer): SanitizedCustomer {
    return payload;
  }
}
