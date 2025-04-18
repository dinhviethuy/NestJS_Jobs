import { createZodDto } from 'nestjs-zod'
import {
  CreatePermissionSchema,
  PaginationResSchema,
  PaginationSchema,
  UpdatePermissionSchema,
  PermissionParamSchema,
  QuerySchema
} from './permission.model'

export class CreatePermissionDTO extends createZodDto(CreatePermissionSchema) {}
export class UpdatePermissionDTO extends createZodDto(UpdatePermissionSchema) {}

export class PermissionPaginationDTO extends createZodDto(PaginationSchema) {}
export class PaginationResDTO extends createZodDto(PaginationResSchema) {}
export class PermissionParamDTO extends createZodDto(PermissionParamSchema) {}
export class QueryDTO extends createZodDto(QuerySchema) {}
