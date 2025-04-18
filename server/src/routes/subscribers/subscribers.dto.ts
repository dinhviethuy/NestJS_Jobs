import { createZodDto } from 'nestjs-zod'
import { CreateSubscribersBodySchema, UpdateSubscribersBodySchema, SubscriberDetailSchema } from './subscribers.model'

export class CreateSubscribersBodyDTO extends createZodDto(CreateSubscribersBodySchema) {}
export class UpdateSubscribersBodyDTO extends createZodDto(UpdateSubscribersBodySchema) {}
export class SubscriberDetailDTO extends createZodDto(SubscriberDetailSchema) {}
