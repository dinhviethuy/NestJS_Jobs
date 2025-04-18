import { Module } from '@nestjs/common'
import { AuthService } from './auth.service'
import { PassportModule } from '@nestjs/passport'
import { AuthController } from './auth.controller'
import { LocalStrategy } from './strategy/local.strategy'
import { JwtStrategy } from './strategy/jwt.strategy'
import { AuthRepo } from './auth.repo'

@Module({
  imports: [PassportModule],
  providers: [AuthService, AuthRepo, LocalStrategy, JwtStrategy],
  controllers: [AuthController]
})
export class AuthModule {}
