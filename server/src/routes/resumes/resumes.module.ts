import { Module } from '@nestjs/common'
import { ResumesController } from './resumes.controller'
import { ResumesService } from './resumes.service'
import { ResumeRepo } from './resumes.repo'

@Module({
  controllers: [ResumesController],
  providers: [ResumesService, ResumeRepo]
})
export class ResumesModule {}
