import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common'
import { UsersService } from './users.service'
import { CreateUserBodyDTO, GetUserParamsDTO, QueryDTO, UpdateUserBodyDTO } from './users.dto'
import { ZodSerializerDto } from 'nestjs-zod'
import { UserDetailDTO } from 'src/shared/dtos/shared-user.dto'
import { MessageRes } from 'src/shared/decorators/message.decorator'
import { ActiveUser, FieldUserType } from 'src/shared/decorators/active-user.decorator'
import { PaginationResDTO } from 'src/routes/users/users.dto'

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @ZodSerializerDto(PaginationResDTO)
  @MessageRes('Get users successfully')
  find(@Query() query: QueryDTO) {
    return this.usersService.find(query)
  }

  @Get(':id')
  @ZodSerializerDto(UserDetailDTO)
  @MessageRes('Get user successfully')
  findById(@Param() param: GetUserParamsDTO) {
    return this.usersService.findById(param.id)
  }

  @Post()
  @MessageRes('Create user successfully')
  @ZodSerializerDto(UserDetailDTO)
  create(@Body() body: CreateUserBodyDTO, @ActiveUser() user: FieldUserType) {
    return this.usersService.create(body, user)
  }

  @Patch(':id')
  // @ZodSerializerDto(UserDetailDTO)
  @MessageRes('Update user successfully')
  update(@Body() body: UpdateUserBodyDTO, @ActiveUser() user: FieldUserType, @Param() param: GetUserParamsDTO) {
    return this.usersService.update({
      data: body,
      userId: param.id,
      user: user
    })
  }

  @Delete(':id')
  // @ZodSerializerDto(MessageResDTO)
  @MessageRes('Delete user successfully')
  delete(@Param() param: GetUserParamsDTO, @ActiveUser() user: FieldUserType) {
    return this.usersService.delete(param.id, user)
  }
}
