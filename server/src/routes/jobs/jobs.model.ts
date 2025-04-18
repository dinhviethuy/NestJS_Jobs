import { ObjectId } from 'mongodb'
import { z } from 'zod'

export const JobSchema = z.object({
  _id: z
    .custom<ObjectId>((val) => {
      return ObjectId.isValid(val)
    })
    .optional(),
  location: z.string().optional(),
  name: z.string().min(0),
  skills: z.array(z.string()).optional(),
  salary: z.number().min(0),
  quantity: z.number().min(1),
  level: z.string(),
  description: z.string().min(0),
  startDate: z
    .custom<Date>(
      (val) => {
        let date: Date
        if (typeof val === 'string' || val instanceof String) {
          date = new Date(val as string)
        } else if (val instanceof Date) {
          date = val
        } else {
          return false
        }
        return !isNaN(date.getTime())
      },
      {
        message: 'Invalid date format'
      }
    )
    .transform((val) => {
      if (typeof val === 'string') return new Date(val)
      return val
    }),
  isActive: z.boolean().default(true),
  endDate: z
    .custom<Date>(
      (val) => {
        let date: Date
        if (typeof val === 'string' || val instanceof String) {
          date = new Date(val as string)
        } else if (val instanceof Date) {
          date = val
        } else {
          return false
        }
        return !isNaN(date.getTime())
      },
      {
        message: 'Invalid date format'
      }
    )
    .transform((val) => {
      if (typeof val === 'string') return new Date(val)
      return val
    }),
  company: z
    .object({
      _id: z.custom<ObjectId>((val) => {
        return ObjectId.isValid(val)
      }),
      name: z.string().min(2),
      logo: z.string().default('')
    })
    .nullable()
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

export const JobDetailSchema = JobSchema.extend({
  startDate: z.date().nullable().optional(),
  endDate: z.date().nullable().optional(),
  company: z
    .object({
      _id: z.custom<ObjectId>((val) => {
        return ObjectId.isValid(val)
      }),
      name: z.string().min(2),
      logo: z.string().default('')
    })
    .nullable()
    .optional()
})
export const CreateJobBodySchema = JobSchema.omit({
  _id: true,
  createdAt: true,
  updatedAt: true,
  deletedAt: true,
  createdBy: true,
  updatedBy: true,
  deletedBy: true
}).strict()

export const UpdateJobBodySchema = CreateJobBodySchema.partial()

export const JobParamsSchema = z
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
  result: z.array(JobDetailSchema)
})

export const PaginationSchema = QuerySchema

export type JobType = z.infer<typeof JobSchema>
export type JobDetailType = z.infer<typeof JobDetailSchema>
export type CreateJobBodyType = z.infer<typeof CreateJobBodySchema>
export type UpdateJobBodyType = z.infer<typeof UpdateJobBodySchema>
export type QueryType = z.infer<typeof QuerySchema>
export type PaginationType = z.infer<typeof PaginationSchema>
export type PaginationResType = z.infer<typeof PaginationResSchema>
