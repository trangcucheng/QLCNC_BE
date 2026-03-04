import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy, StrategyOptions } from 'passport-jwt';

import { AuthPayload } from '../auth-payload.interface';
require('dotenv').config();

@Injectable()
export class JsonWebTokenStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET_KEY
    } as StrategyOptions);
  }

  async validate(payload: AuthPayload) {
    return {
      userName: payload.userName,
      id: payload.id,
      role: payload.role
    };
  }
}
