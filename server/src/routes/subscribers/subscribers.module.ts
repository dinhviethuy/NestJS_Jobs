import { Module } from '@nestjs/common'
import { SubscribersService } from './subscribers.service'
import { SubscribersController } from './subscribers.controller'
import { SubscribersRepo } from './subscribers.repo'

@Module({
  controllers: [SubscribersController],
  providers: [SubscribersService, SubscribersRepo]
})
export class SubscribersModule {}
