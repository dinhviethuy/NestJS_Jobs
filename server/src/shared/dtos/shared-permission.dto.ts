import { createZodDto } from 'nestjs-zod'
import { PermissionDetailSchema } from 'src/shared/models/shared-permission.model'

export class PermissionDetailDTO extends createZodDto(PermissionDetailSchema) {}
