import { Global, Module } from '@nestjs/common'
import { HashingService } from './services/hashing.service'
import { MongoDBService } from './services/mongodb.service'
import { ShareUsersRepo } from './repositories/share-users.repo'
import { LocalAuthGuard } from './guards/local.guard'
import { JwtModule } from '@nestjs/jwt'
import { TokenService } from './services/token.service'
import { APP_GUARD } from '@nestjs/core'
import { JwtAuthGuard } from './guards/jwt-auth.guard'
import { CloudinaryService } from './services/cloudinary.service'
import { SharedMailService } from './services/shared-mail.service'
import { CustomMailerModule } from './modules/mailer.module'
import { ScheduleModule } from '@nestjs/schedule'
import { ThrottlerModule } from '@nestjs/throttler'

const sharedServices = [
  HashingService,
  MongoDBService,
  ShareUsersRepo,
  LocalAuthGuard,
  TokenService,
  CloudinaryService,
  SharedMailService
]

@Global()
@Module({
  providers: [
    ...sharedServices,
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard
    }
  ],
  exports: sharedServices,
  imports: [
    JwtModule,
    CustomMailerModule,
    ScheduleModule.forRoot(),
    ThrottlerModule.forRoot({
      throttlers: [
        {
          ttl: 60000,
          limit: 5
        }
      ]
    })
  ]
})
export class SharedModule {}
