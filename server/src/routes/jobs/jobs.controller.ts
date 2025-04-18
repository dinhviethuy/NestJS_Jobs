import { Body, Controller, Param, Post, Patch, Get, Delete, Query } from '@nestjs/common'
import { JobsService } from './jobs.service'
import { CreateJobBodyDTO, JobDetailDTO, JobParamsDTO, PaginationResDTO, QueryDTO, UpdateJobBodyDTO } from './jobs.dto'
import { ActiveUser, FieldUserType } from 'src/shared/decorators/active-user.decorator'
import { ZodSerializerDto } from 'nestjs-zod'
import { MessageRes } from 'src/shared/decorators/message.decorator'
import { IsPublic } from 'src/shared/decorators/auth.decorator'

@Controller('jobs')
export class JobsController {
  constructor(private readonly jobsService: JobsService) {}

  @Get()
  @IsPublic()
  @ZodSerializerDto(PaginationResDTO)
  @MessageRes('Get users successfully')
  find(@Query() query: QueryDTO, @ActiveUser() user?: FieldUserType) {
    return this.jobsService.find(query, user)
  }

  @Get(':id')
  @IsPublic()
  @ZodSerializerDto(JobDetailDTO)
  @MessageRes('Job fetched successfully')
  findById(@Param() param: JobParamsDTO) {
    return this.jobsService.findById({ jobId: param.id })
  }

  @Post()
  @ZodSerializerDto(JobDetailDTO)
  @MessageRes('Job created successfully')
  create(@Body() body: CreateJobBodyDTO, @ActiveUser() user: FieldUserType) {
    return this.jobsService.create({
      data: body,
      createdById: user._id,
      email: user.email
    })
  }

  @Patch(':id')
  // @ZodSerializerDto(JobDetailDTO)
  @MessageRes('Job created successfully')
  udpate(@Body() body: UpdateJobBodyDTO, @ActiveUser() user: FieldUserType, @Param() param: JobParamsDTO) {
    return this.jobsService.update({
      data: body,
      updatedById: user._id,
      email: user.email,
      jobId: param.id
    })
  }

  @Delete(':id')
  @MessageRes('Job deleted successfully')
  delete(@Param() param: JobParamsDTO, @ActiveUser() user: FieldUserType) {
    return this.jobsService.delete({
      jobId: param.id,
      deletedById: user._id,
      email: user.email
    })
  }
}
