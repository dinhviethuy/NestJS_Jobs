import { createZodDto } from 'nestjs-zod'
import {
  CreateCompanyBodySchema,
  UpdateCompanyBodySchema,
  CompanyDetailResSchema,
  CompanyParamsSchema,
  QuerySchema,
  PaginationResSchema
} from './companies.model'

export class CreateCompanyBodyDTO extends createZodDto(CreateCompanyBodySchema) {}
export class UpdateCompanyBodyDTO extends createZodDto(UpdateCompanyBodySchema) {}
export class CompanyDetailResDTO extends createZodDto(CompanyDetailResSchema) {}
export class CompanyParamsDTO extends createZodDto(CompanyParamsSchema) {}
export class QueryDTO extends createZodDto(QuerySchema) {}
export class PaginationResDTO extends createZodDto(PaginationResSchema) {}
