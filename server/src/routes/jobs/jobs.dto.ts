import { createZodDto } from 'nestjs-zod'
import {
  JobDetailSchema,
  CreateJobBodySchema,
  UpdateJobBodySchema,
  JobParamsSchema,
  QuerySchema,
  PaginationResSchema
} from './jobs.model'

export class JobDetailDTO extends createZodDto(JobDetailSchema) {}
export class CreateJobBodyDTO extends createZodDto(CreateJobBodySchema) {}
export class UpdateJobBodyDTO extends createZodDto(UpdateJobBodySchema) {}
export class JobParamsDTO extends createZodDto(JobParamsSchema) {}
export class QueryDTO extends createZodDto(QuerySchema) {}
export class PaginationResDTO extends createZodDto(PaginationResSchema) {}
