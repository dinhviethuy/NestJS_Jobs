import { ObjectId } from 'mongodb'
import { z } from 'zod'

export const PermissionModelSchema = z.object({
  _id: z
    .custom<ObjectId>((val) => {
      return ObjectId.isValid(val)
    })
    .optional(),
  name: z.string(),
  apiPath: z.string(),
  method: z.string().default(''),
  module: z.string(),

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

export const PermissionDetailSchema = PermissionModelSchema
