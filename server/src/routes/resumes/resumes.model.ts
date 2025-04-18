import { ObjectId } from 'mongodb'
import { ResumeStatus } from 'src/shared/constants/orther.constant'
import { z } from 'zod'

export const ResumeSchema = z.object({
  _id: z
    .custom<ObjectId>((val) => {
      return ObjectId.isValid(val)
    })
    .optional(),
  email: z.string().email(),
  userId: z.custom<ObjectId>((val) => {
    return ObjectId.isValid(val)
  }),
  url: z.string(),
  status: z
    .enum([ResumeStatus.PENDING, ResumeStatus.APPROVED, ResumeStatus.REJECTED, ResumeStatus.REVIEWING])
    .default(ResumeStatus.PENDING)
    .optional(),
  companyId: z.custom<ObjectId>((val) => {
    return ObjectId.isValid(val)
  }),
  jobId: z.custom<ObjectId>((val) => {
    return ObjectId.isValid(val)
  }),
  history: z
    .array(
      z.object({
        status: z.string(),
        updatedAt: z.date(),
        updatedBy: z.object({
          _id: z.custom<ObjectId>((val) => {
            return ObjectId.isValid(val)
          }),
          email: z.string().email()
        })
      })
    )
    .default([])
    .optional(),
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

export const CreateResumeBodySchema = ResumeSchema.pick({
  url: true,
  companyId: true,
  jobId: true
}).strict()

export const UpdateResumeBodySchema = z
  .object({
    status: z
      .enum([ResumeStatus.PENDING, ResumeStatus.APPROVED, ResumeStatus.REJECTED, ResumeStatus.REVIEWING])
      .default(ResumeStatus.PENDING)
  })
  .strict()

export const ParamsResumeSchema = z
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

export const ResumeDetailSchema = ResumeSchema.extend({
  companyId: z.union([
    z.object({
      _id: z.custom<ObjectId>((val) => {
        return ObjectId.isValid(val)
      }),
      name: z.string(),
      logo: z.string()
    }),
    z.string()
  ]),
  jobId: z.union([
    z.object({
      _id: z.custom<ObjectId>((val) => {
        return ObjectId.isValid(val)
      }),
      name: z.string()
    }),
    z.string()
  ])
})

export const PaginationResSchema = z.object({
  meta: z.object({
    current: z.number().min(1).default(1),
    pageSize: z.number(),
    pages: z.number(),
    total: z.number()
  }),
  result: z.array(ResumeDetailSchema)
})

export const PaginationSchema = QuerySchema

export type ResumeType = z.infer<typeof ResumeSchema>
export type ParamsResumeType = z.infer<typeof ParamsResumeSchema>
export type QueryType = z.infer<typeof QuerySchema>
export type ResumeDetailType = z.infer<typeof ResumeDetailSchema>
export type PaginationResType = z.infer<typeof PaginationResSchema>
export type CreateResumeBodyType = z.infer<typeof CreateResumeBodySchema>
export type PaginationType = z.infer<typeof PaginationSchema>
export type UpdateResumeBodyType = z.infer<typeof UpdateResumeBodySchema>
