import { ObjectId } from 'mongodb'
import { z } from 'zod'

export const SubscribersModelSchema = z.object({
  _id: z
    .custom<ObjectId>((val) => {
      return ObjectId.isValid(val)
    })
    .optional(),
  name: z.string(),
  email: z.string().email(),
  skills: z.array(z.string()).default([]),

  createdAt: z.date().nullable().optional(),
  updatedAt: z.date().nullable().optional(),
  deletedAt: z.date().nullable().optional()
})

export const SubscriberDetailSchema = SubscribersModelSchema

export const CreateSubscribersBodySchema = SubscribersModelSchema.pick({
  email: true,
  skills: true,
  name: true
}).strict()

export const UpdateSubscribersBodySchema = SubscribersModelSchema

export type SubscribersModelType = z.infer<typeof SubscribersModelSchema>
export type CreateSubscribersBodyType = z.infer<typeof CreateSubscribersBodySchema>
export type UpdateSubscribersBodyType = z.infer<typeof UpdateSubscribersBodySchema>
export type SubscriberDetailType = z.infer<typeof SubscriberDetailSchema>
