import { ObjectId } from 'mongodb'
import { PermissionDetailSchema } from 'src/shared/models/shared-permission.model'
import { z } from 'zod'

export const RoleModelSchema = z.object({
  _id: z
    .custom<ObjectId>((val) => {
      return ObjectId.isValid(val)
    })
    .optional(),
  name: z.string(),
  description: z.string().optional(),
  isActive: z.boolean().default(true),
  permissions: z.array(z.string()).default([]),

  createdAt: z.date().nullable().optional(),
  updatedAt: z.date().nullable().optional(),
  deletedAt: z.date().nullable().optional(),
  createdBy: z
    .object({
      _id: z.custom<ObjectId>((val) => {
        return ObjectId.isValid(val)
      }),
      email: z.string().email()
    })
    .nullable()
    .optional(),
  updatedBy: z
    .object({
      _id: z.custom<ObjectId>((val) => {
        return ObjectId.isValid(val)
      }),
      email: z.string().email()
    })
    .nullable()
    .optional(),
  deletedBy: z
    .object({
      _id: z.custom<ObjectId>((val) => {
        return ObjectId.isValid(val)
      }),
      email: z.string().email()
    })
    .nullable()
    .optional()
})

export const RoleDetailSchema = RoleModelSchema.extend({
  permissions: z.array(PermissionDetailSchema)
})

export const CreateRoleSchema = RoleModelSchema.pick({
  name: true,
  description: true,
  isActive: true,
  permissions: true
}).strict()

export const UpdateRoleSchema = CreateRoleSchema.partial()

export const RoleParamSchema = z
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
  result: z.array(RoleDetailSchema)
})

export const PaginationSchema = QuerySchema

export type RoleModelType = z.infer<typeof RoleModelSchema>
export type QueryType = z.infer<typeof QuerySchema>
export type CreateRoleType = z.infer<typeof CreateRoleSchema>
export type PaginationType = z.infer<typeof PaginationSchema>
export type UpdateRoleType = z.infer<typeof UpdateRoleSchema>
export type RoleDetailType = z.infer<typeof RoleDetailSchema>
export type PaginationResType = z.infer<typeof PaginationResSchema>
