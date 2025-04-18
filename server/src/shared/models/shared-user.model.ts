import { ObjectId } from 'mongodb'
import { z } from 'zod'

export const UserSchema = z.object({
  _id: z
    .custom<ObjectId>((val) => {
      return ObjectId.isValid(val)
    })
    .optional(),
  email: z.string().email(),
  password: z.string().min(6),
  address: z.string().nullable().optional(),
  name: z.string().min(2).max(32),
  age: z.number().min(0).nullable().optional(),
  gender: z.string().optional().nullable(),
  role: z.string(),
  company: z
    .object({
      _id: z
        .custom<ObjectId>((val) => {
          return ObjectId.isValid(val)
        })
        .optional(),
      name: z.string().min(2).optional()
    })
    .nullable()
    .optional(),
  refreshToken: z.string().nullable().default(null).optional(),
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
export const UserDetailSchema = UserSchema.omit({
  password: true,
  refreshToken: true
}).extend({
  role: z.union([
    z.string(),
    z.object({
      _id: z.custom<ObjectId>((val) => {
        return ObjectId.isValid(val)
      }),
      name: z.string()
    })
  ])
})

export type UserType = z.infer<typeof UserSchema>
export type UserDetailType = z.infer<typeof UserDetailSchema>
