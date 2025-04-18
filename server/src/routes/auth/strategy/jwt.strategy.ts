import { PassportStrategy } from '@nestjs/passport'
import { Injectable } from '@nestjs/common'
import { ExtractJwt, Strategy } from 'passport-jwt'
import envConfig from 'src/shared/config'
import { AccessTokenPayload } from 'src/shared/types/jwt.type'

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: envConfig.ACCESS_TOKEN_SECRET
    })
  }

  validate(payload: AccessTokenPayload) {
    return {
      _id: payload._id,
      email: payload.email,
      name: payload.name,
      role: payload.role
    }
  }
}
