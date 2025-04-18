import { Module } from '@nestjs/common'
import { JobsController } from './jobs.controller'
import { JobsService } from './jobs.service'
import { JobsRepo } from './jobs.repo'

@Module({
  controllers: [JobsController],
  providers: [JobsService, JobsRepo]
})
export class JobsModule {}
