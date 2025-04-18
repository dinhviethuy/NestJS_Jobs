import { createZodDto } from 'nestjs-zod'
import {
  CreateUserBodySchema,
  GetUserParamsSchema,
  PaginationResSchema,
  QuerySchema,
  UpdateUserBodySchema
} from './users.model'

export class CreateUserBodyDTO extends createZodDto(CreateUserBodySchema) {}
export class UpdateUserBodyDTO extends createZodDto(UpdateUserBodySchema) {}
export class GetUserParamsDTO extends createZodDto(GetUserParamsSchema) {}
export class QueryDTO extends createZodDto(QuerySchema) {}
export class PaginationResDTO extends createZodDto(PaginationResSchema) {}
