import { PassportStrategy } from '@nestjs/passport'
import { ExtractJwt, Strategy } from 'passport-jwt'
import { Request } from 'express'
import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'

type JwtPayload = {
  sub: string
  email: string
}

@Injectable()
export class RtStrategy extends PassportStrategy(Strategy, 'jwt-refresh') {
  constructor(config: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: config.getOrThrow<string>('RT_SECRET'),
      passReqToCallback: true,
    })
  }

  validate(req: Request, payload: JwtPayload) {
    const refreshToken = req.get('authorization')!.replace('Bearer', '').trim()
    return {
      ...payload,
      refreshToken,
    }
  }
}
