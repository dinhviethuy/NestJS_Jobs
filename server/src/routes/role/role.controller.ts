import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common'
import { RoleService } from './role.service'
import { MessageRes } from 'src/shared/decorators/message.decorator'
import { ActiveUser, FieldUserType } from 'src/shared/decorators/active-user.decorator'
import { ZodSerializerDto } from 'nestjs-zod'
import { CreateRoleDTO, RoleDetailDTO, RoleParamDTO, QueryDTO, UpdateRoleDTO } from './role.dto'

@Controller('roles')
export class RoleController {
  constructor(private readonly roleService: RoleService) {}

  @Get()
  @MessageRes('Companies fetched successfully')
  // @ZodSerializerDto(PaginationResDTO)
  find(@Query() query: QueryDTO) {
    return this.roleService.find(query)
  }

  @Get(':id')
  @MessageRes('Company fetched successfully')
  @ZodSerializerDto(RoleDetailDTO)
  findById(@Param() param: RoleParamDTO) {
    return this.roleService.findById(param.id)
  }

  @Post()
  @MessageRes('Company created successfully')
  // @ZodSerializerDto(RoleDetailDTO)
  create(@Body() body: CreateRoleDTO, @ActiveUser() user: FieldUserType) {
    return this.roleService.create({
      data: body,
      createdById: user._id,
      email: user.email
    })
  }

  @Patch(':id')
  @MessageRes('Company updated successfully')
  udpate(@Body() body: UpdateRoleDTO, @ActiveUser() user: FieldUserType, @Param() param: RoleParamDTO) {
    return this.roleService.update({
      data: body,
      updatedById: user._id,
      email: user.email,
      idRole: param.id
    })
  }

  @Delete(':id')
  @MessageRes('Company deleted successfully')
  delete(@ActiveUser() user: FieldUserType, @Param() param: RoleParamDTO) {
    return this.roleService.delete({
      idRole: param.id,
      deletedById: user._id,
      email: user.email
    })
  }
}
