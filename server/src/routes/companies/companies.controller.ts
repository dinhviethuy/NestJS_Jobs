import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common'
import { CompaniesService } from './companies.service'
import { ZodSerializerDto } from 'nestjs-zod'
import {
  CompanyDetailResDTO,
  CompanyParamsDTO,
  CreateCompanyBodyDTO,
  PaginationResDTO,
  UpdateCompanyBodyDTO,
  QueryDTO
} from './companies.dto'
import { ActiveUser, FieldUserType } from 'src/shared/decorators/active-user.decorator'
import { MessageRes } from 'src/shared/decorators/message.decorator'
import { IsPublic } from 'src/shared/decorators/auth.decorator'

@Controller('companies')
export class CompaniesController {
  constructor(private readonly companiesService: CompaniesService) {}

  @Get()
  @IsPublic()
  @MessageRes('Companies fetched successfully')
  @ZodSerializerDto(PaginationResDTO)
  find(@Query() query: QueryDTO) {
    return this.companiesService.find(query)
  }

  @Get(':id')
  @IsPublic()
  @MessageRes('Company fetched successfully')
  @ZodSerializerDto(CompanyDetailResDTO)
  findById(@Param() param: CompanyParamsDTO) {
    return this.companiesService.findById(param.id)
  }

  @Post()
  @MessageRes('Company created successfully')
  @ZodSerializerDto(CompanyDetailResDTO)
  create(@Body() body: CreateCompanyBodyDTO, @ActiveUser() user: FieldUserType) {
    return this.companiesService.create({
      data: body,
      createdById: user._id,
      email: user.email
    })
  }

  @Patch(':id')
  // @ZodSerializerDto(CompanyDetailResDTO)
  @MessageRes('Company updated successfully')
  udpate(@Body() body: UpdateCompanyBodyDTO, @ActiveUser() user: FieldUserType, @Param() param: CompanyParamsDTO) {
    return this.companiesService.update({
      data: body,
      updatedById: user._id,
      email: user.email,
      idCompany: param.id
    })
  }

  @Delete(':id')
  // @ZodSerializerDto(MessageResDTO)
  @MessageRes('Company deleted successfully')
  delete(@ActiveUser() user: FieldUserType, @Param() param: CompanyParamsDTO) {
    return this.companiesService.delete({
      idCompany: param.id,
      deletedById: user._id,
      email: user.email
    })
  }
}
