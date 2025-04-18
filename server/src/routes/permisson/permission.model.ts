import { ObjectId } from 'mongodb'
import { PermissionDetailSchema, PermissionModelSchema } from 'src/shared/models/shared-permission.model'
import { z } from 'zod'

export const CreatePermissionSchema = PermissionModelSchema.pick({
  name: true,
  apiPath: true,
  method: true,
  module: true
}).strict()

export const UpdatePermissionSchema = CreatePermissionSchema.partial()

export const PermissionParamSchema = z
  .object({
    id: z.custom<ObjectId>((val) => {
      return ObjectId.isValid(val)
    })
  })
  .strict()

export const QuerySchema = z
  .object({
    current: z.coerce.number().min(1).default(1),
    pageSize: z.coerce.number().min(1).max(100).default(10)
  })
  .catchall(z.string())

export const PaginationResSchema = z.object({
  meta: z.object({
    current: z.number().min(1).default(1),
    pageSize: z.number(),
    pages: z.number(),
    total: z.number()
  }),
  result: z.array(PermissionDetailSchema)
})

export const PaginationSchema = QuerySchema

export type PermissionModelType = z.infer<typeof PermissionModelSchema>
export type QueryType = z.infer<typeof QuerySchema>
export type CreatePermissionType = z.infer<typeof CreatePermissionSchema>
export type PaginationType = z.infer<typeof PaginationSchema>
export type UpdatePermissionType = z.infer<typeof UpdatePermissionSchema>
export type PermissionDetailType = z.infer<typeof PermissionDetailSchema>
export type PaginationResType = z.infer<typeof PaginationResSchema>
