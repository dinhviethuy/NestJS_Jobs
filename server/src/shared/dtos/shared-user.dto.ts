import { createZodDto } from 'nestjs-zod'
import { UserDetailSchema } from 'src/shared/models/shared-user.model'

export class UserDetailDTO extends createZodDto(UserDetailSchema) {}
