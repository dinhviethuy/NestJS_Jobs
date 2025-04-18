import { createParamDecorator, ExecutionContext } from '@nestjs/common'
import { ObjectId } from 'mongodb'
import { UserType } from 'src/shared/models/shared-user.model'

export type FieldUserType = Pick<UserType, '_id' | 'email' | 'name' | 'role'> & {
  _id: string | ObjectId
  permissions: string[]
}

export const ActiveUser = createParamDecorator((filed: keyof FieldUserType | null, ctx: ExecutionContext) => {
  const request = ctx.switchToHttp().getRequest()
  return filed ? request.user[filed] : request.user
})
