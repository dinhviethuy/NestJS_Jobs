import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common'
import { ResumesService } from './resumes.service'
import {
  CreateResumeBodyDTO,
  PaginationResDTO,
  ParamsResumeDTO,
  QueryDTO,
  ResumeDetailDTO,
  UpdateResumeBodyDTO
} from './resumes.dto'
import { MessageRes } from 'src/shared/decorators/message.decorator'
import { ZodSerializerDto } from 'nestjs-zod'
import { ActiveUser, FieldUserType } from 'src/shared/decorators/active-user.decorator'

@Controller('resumes')
export class ResumesController {
  constructor(private readonly resumeService: ResumesService) {}

  @Post('by-user')
  @MessageRes('Resume fetched successfully')
  @ZodSerializerDto(ResumeDetailDTO)
  findByUserId(@ActiveUser() user: FieldUserType) {
    return this.resumeService.findByUserId({
      userId: user._id
    })
  }

  @Get(':id')
  @MessageRes('Resume fetched successfully')
  @ZodSerializerDto(ResumeDetailDTO)
  findById(@Param() param: ParamsResumeDTO, @ActiveUser() user: FieldUserType) {
    return this.resumeService.findById({
      resumeId: param.id,
      role: user.role
    })
  }

  @Get()
  @ZodSerializerDto(PaginationResDTO)
  @MessageRes('Get resumes successfully')
  find(@Query() query: QueryDTO, @ActiveUser() user: FieldUserType) {
    return this.resumeService.find(query, user.role)
  }

  @Post()
  @MessageRes('Resume created successfully')
  @ZodSerializerDto(ResumeDetailDTO)
  create(@ActiveUser() user: FieldUserType, @Body() body: CreateResumeBodyDTO) {
    return this.resumeService.create({
      userId: user._id,
      email: user.email,
      data: body
    })
  }

  @Patch(':id')
  @MessageRes('Resume updated successfully')
  // @ZodSerializerDto(ResumeDetailDTO)
  update(@ActiveUser() user: FieldUserType, @Body() body: UpdateResumeBodyDTO, @Param() param: ParamsResumeDTO) {
    return this.resumeService.update({
      resumeId: param.id,
      email: user.email,
      updatedById: user._id,
      data: body,
      role: user.role
    })
  }

  @Delete(':id')
  @MessageRes('Resume deleted successfully')
  delete(@ActiveUser() user: FieldUserType, @Param() param: ParamsResumeDTO) {
    return this.resumeService.delete({
      resumeId: param.id,
      email: user.email,
      deletedById: user._id,
      role: user.role
    })
  }
}
