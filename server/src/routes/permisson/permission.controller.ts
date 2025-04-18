import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common'
import { PermissionService } from './permission.service'
import { MessageRes } from 'src/shared/decorators/message.decorator'
import { ActiveUser, FieldUserType } from 'src/shared/decorators/active-user.decorator'
import { ZodSerializerDto } from 'nestjs-zod'
import {
  CreatePermissionDTO,
  PaginationResDTO,
  PermissionParamDTO,
  QueryDTO,
  UpdatePermissionDTO
} from './permission.dto'
import { PermissionDetailDTO } from 'src/shared/dtos/shared-permission.dto'

@Controller('permissions')
export class PermissionController {
  constructor(private readonly permissionService: PermissionService) {}

  @Get()
  @MessageRes('Companies fetched successfully')
  @ZodSerializerDto(PaginationResDTO)
  find(@Query() query: QueryDTO) {
    return this.permissionService.find(query)
  }

  @Get(':id')
  @MessageRes('Company fetched successfully')
  @ZodSerializerDto(PermissionDetailDTO)
  findById(@Param() param: PermissionParamDTO) {
    return this.permissionService.findById(param.id)
  }

  @Post()
  @MessageRes('Company created successfully')
  @ZodSerializerDto(PermissionDetailDTO)
  create(@Body() body: CreatePermissionDTO, @ActiveUser() user: FieldUserType) {
    return this.permissionService.create({
      data: body,
      createdById: user._id,
      email: user.email
    })
  }

  @Patch(':id')
  @MessageRes('Company updated successfully')
  udpate(@Body() body: UpdatePermissionDTO, @ActiveUser() user: FieldUserType, @Param() param: PermissionParamDTO) {
    return this.permissionService.update({
      data: body,
      updatedById: user._id,
      email: user.email,
      idPermission: param.id
    })
  }

  @Delete(':id')
  @MessageRes('Company deleted successfully')
  delete(@ActiveUser() user: FieldUserType, @Param() param: PermissionParamDTO) {
    return this.permissionService.delete({
      idPermission: param.id,
      deletedById: user._id,
      email: user.email
    })
  }
}
