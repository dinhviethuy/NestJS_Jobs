import { Module } from '@nestjs/common'
import { CompaniesController } from './companies.controller'
import { CompaniesService } from './companies.service'
import { CompaniesRepo } from './companies.repo'

@Module({
  controllers: [CompaniesController],
  providers: [CompaniesService, CompaniesRepo]
})
export class CompaniesModule {}
