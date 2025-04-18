import { Body, Controller, Delete, Get, Patch, Post } from '@nestjs/common'
import { SubscribersService } from './subscribers.service'
import { ActiveUser, FieldUserType } from 'src/shared/decorators/active-user.decorator'
import { ZodSerializerDto } from 'nestjs-zod'
import { CreateSubscribersBodyDTO, SubscriberDetailDTO, UpdateSubscribersBodyDTO } from './subscribers.dto'

@Controller('subscribers')
export class SubscribersController {
  constructor(private readonly subscribersService: SubscribersService) {}

  @Get()
  find(@ActiveUser() user: FieldUserType) {
    return this.subscribersService.find({ email: user.email })
  }

  @Post('skills')
  findSkills(@ActiveUser() user: FieldUserType) {
    return this.subscribersService.findSkills(user.email)
  }

  @Post()
  @ZodSerializerDto(SubscriberDetailDTO)
  create(@ActiveUser() user: FieldUserType, @Body() body: CreateSubscribersBodyDTO) {
    return this.subscribersService.create({ data: body, email: user.email })
  }

  @Patch()
  // @ZodSerializerDto(SubscriberDetailDTO)
  update(@ActiveUser() user: FieldUserType, @Body() body: UpdateSubscribersBodyDTO) {
    return this.subscribersService.update({ data: body, email: user.email })
  }

  @Delete()
  delete(@ActiveUser() user: FieldUserType) {
    return this.subscribersService.delete({ email: user.email })
  }
}
