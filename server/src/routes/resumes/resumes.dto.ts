import { createZodDto } from 'nestjs-zod'
import {
  ParamsResumeSchema,
  CreateResumeBodySchema,
  PaginationResSchema,
  QuerySchema,
  ResumeDetailSchema,
  UpdateResumeBodySchema
} from './resumes.model'

export class ParamsResumeDTO extends createZodDto(ParamsResumeSchema) {}
export class CreateResumeBodyDTO extends createZodDto(CreateResumeBodySchema) {}
export class UpdateResumeBodyDTO extends createZodDto(UpdateResumeBodySchema) {}
export class QueryDTO extends createZodDto(QuerySchema) {}
export class PaginationResDTO extends createZodDto(PaginationResSchema) {}
export class ResumeDetailDTO extends createZodDto(ResumeDetailSchema) {}
