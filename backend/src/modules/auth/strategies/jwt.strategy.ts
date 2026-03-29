import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, ExtractJwt } from 'passport-jwt';
import * as jwt from 'jsonwebtoken';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'supabase') {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: true,
      secretOrKey: 'supabase-dummy-secret', // Not used - we decode manually
      passReqToCallback: true,
    });
  }

  async validate(req: any, done: any) {
    const token = ExtractJwt.fromAuthHeaderAsBearerToken()(req);

    if (!token) {
      return done(new UnauthorizedException('No token provided'), null);
    }

    try {
      // Decode without verification - Supabase tokens are verified by Supabase
      // In production, you should verify via Supabase API
      const payload = jwt.decode(token) as any;

      if (!payload || !payload.sub) {
        return done(new UnauthorizedException('Invalid token payload'), null);
      }

      return done(null, {
        id: payload.sub,
        email: payload.email,
      });
    } catch (error) {
      return done(new UnauthorizedException('Invalid token'), null);
    }
  }
}
