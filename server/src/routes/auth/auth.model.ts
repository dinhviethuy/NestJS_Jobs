import { ObjectId } from 'mongodb'
import { PermissionDetailSchema } from 'src/shared/models/shared-permission.model'
import { UserSchema } from 'src/shared/models/shared-user.model'
import { z } from 'zod'

export const LoginBodySchema = UserSchema.pick({
  password: true
})
  .extend({
    username: UserSchema.shape.email
  })
  .strict()

export const RegisterBodySchema = UserSchema.pick({
  email: true,
  password: true,
  age: true,
  gender: true,
  name: true,
  address: true
}).strict()

export const RefreshTokenBodySchema = z.object({}).strict()
export const EmptyBodySchema = z.object({}).strict()

export const LoginResponseSchema = z.object({
  access_token: z.string(),
  user: UserSchema.pick({
    name: true,
    email: true
  }).extend({
    _id: z.union([z.custom<ObjectId>((val) => ObjectId.isValid(val)), z.string()]),
    role: z.union([
      z.string(),
      z.object({
        _id: z.custom<ObjectId>((val) => ObjectId.isValid(val)),
        name: z.string()
      })
    ]),
    permissions: z.array(
      PermissionDetailSchema.pick({
        _id: true,
        name: true,
        apiPath: true,
        method: true,
        module: true
      })
    )
  })
})

export const RefreshTokenResSchema = LoginResponseSchema

export const AccountResponseSchema = LoginResponseSchema.pick({
  user: true
})

export type LoginBodyType = z.infer<typeof LoginBodySchema>
export type RegisterBodyType = z.infer<typeof RegisterBodySchema>
export type RefreshTokenBodyType = z.infer<typeof RefreshTokenBodySchema>
export type LoginResponseType = z.infer<typeof LoginResponseSchema>
export type RefreshTokenResType = LoginResponseType
