import { ObjectId } from 'mongodb'
import { UserDetailSchema, UserSchema } from 'src/shared/models/shared-user.model'
import { z } from 'zod'

export const CreateUserBodySchema = UserSchema.pick({
  email: true,
  password: true,
  name: true,
  age: true,
  gender: true,
  company: true,
  role: true,
  address: true
}).strict()

export const GetUserParamsSchema = z
  .object({
    id: z.preprocess(
      (val: any) => {
        if (!ObjectId.isValid(val)) {
          return null
        }
        return val
      },
      z.string({
        required_error: 'userId is required',
        invalid_type_error: 'userId must be a valid ObjectId'
      })
    )
  })
  .strict()

export const UpdateUserBodySchema = UserSchema.pick({
  email: true,
  name: true,
  age: true,
  gender: true,
  company: true,
  role: true,
  address: true
})
  .partial()
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
  result: z.array(UserDetailSchema)
})

export const PaginationSchema = QuerySchema

export type CreateUserBodyType = z.infer<typeof CreateUserBodySchema>
export type UpdateUserBodyType = z.infer<typeof UpdateUserBodySchema>
export type GetUserParamsType = z.infer<typeof GetUserParamsSchema>
export type QueryType = z.infer<typeof QuerySchema>
export type PaginationResType = z.infer<typeof PaginationResSchema>
export type PaginationType = z.infer<typeof PaginationSchema>
