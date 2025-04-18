import { createZodDto } from 'nestjs-zod'
import {
  CreateRoleSchema,
  PaginationResSchema,
  PaginationSchema,
  RoleDetailSchema,
  UpdateRoleSchema,
  RoleParamSchema,
  QuerySchema
} from './role.model'

export class CreateRoleDTO extends createZodDto(CreateRoleSchema) {}
export class UpdateRoleDTO extends createZodDto(UpdateRoleSchema) {}
export class RoleDetailDTO extends createZodDto(RoleDetailSchema) {}
export class RolePaginationDTO extends createZodDto(PaginationSchema) {}
export class PaginationResDTO extends createZodDto(PaginationResSchema) {}
export class RoleParamDTO extends createZodDto(RoleParamSchema) {}
export class QueryDTO extends createZodDto(QuerySchema) {}
