import { ObjectId } from 'mongodb'
import { z } from 'zod'

export const CompaniesModelSchema = z.object({
  _id: z
    .custom<ObjectId>((val) => {
      return ObjectId.isValid(val)
    })
    .optional(),
  name: z.string(),
  description: z.string(),
  logo: z.string().default(''),
  address: z.string(),
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

export const CompanyDetailResSchema = CompaniesModelSchema.extend({
  _id: z.custom<ObjectId>((val) => {
    return ObjectId.isValid(val)
  })
})

export const CompanyParamsSchema = z
  .object({
    id: z.preprocess(
      (val: any) => {
        if (!ObjectId.isValid(val)) {
          return null
        }
        return val
      },
      z.string({
        required_error: 'id is required',
        invalid_type_error: 'id must be a valid ObjectId'
      })
    )
  })
  .strict()

export const CreateCompanyBodySchema = CompaniesModelSchema.pick({
  logo: true,
  name: true,
  description: true,
  address: true
}).strict()

export const QuerySchema = z
  .object({
    current: z.coerce.number().min(1).default(1),
    pageSize: z.coerce.number().min(1).max(100).default(10)
  })
  .catchall(z.string())

export const PaginationSchema = QuerySchema

export const PaginationResSchema = z.object({
  meta: z.object({
    current: z.number().min(1).default(1),
    pageSize: z.number(),
    pages: z.number(),
    total: z.number()
  }),
  result: z.array(CompanyDetailResSchema)
})

export const UpdateCompanyBodySchema = CreateCompanyBodySchema.partial()

export type CompaniesModelType = z.infer<typeof CompaniesModelSchema>
export type CreateCompanyBodyType = z.infer<typeof CreateCompanyBodySchema>
export type CompanyParamsType = z.infer<typeof CompanyParamsSchema>
export type UpdateCompanyBodyType = z.infer<typeof UpdateCompanyBodySchema>
export type QueryType = z.infer<typeof QuerySchema>
export type PaginationResType = z.infer<typeof PaginationResSchema>
export type PaginationType = z.infer<typeof PaginationSchema>
