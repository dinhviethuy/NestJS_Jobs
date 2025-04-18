import { Injectable, NotFoundException } from '@nestjs/common'
import { CompaniesRepo } from './companies.repo'
import { CreateCompanyBodyType, PaginationType, UpdateCompanyBodyType } from './companies.model'
import { ObjectId } from 'mongodb'

@Injectable()
export class CompaniesService {
  constructor(private readonly companiesRepo: CompaniesRepo) {}

  async find(pagination: PaginationType) {
    const result = await this.companiesRepo.find(pagination)
    return result
  }

  async findById(idCompany: string | ObjectId) {
    const company = await this.companiesRepo.findById(idCompany)
    if (!company) {
      throw new NotFoundException('Công ty không tồn tại')
    }
    return company
  }

  async create({
    data,
    createdById,
    email
  }: {
    data: CreateCompanyBodyType
    createdById: ObjectId | string
    email: string
  }) {
    const result = await this.companiesRepo.create({
      data,
      createdById,
      email
    })
    return result
  }

  async update({
    data,
    email,
    updatedById,
    idCompany
  }: {
    data: UpdateCompanyBodyType
    updatedById: ObjectId | string
    email: string
    idCompany: string | ObjectId
  }) {
    try {
      const company = await this.companiesRepo.update({
        data,
        email,
        updatedById,
        idCompany
      })
      if (!company) {
        throw new NotFoundException('Công ty không tồn tại')
      }
      return company
    } catch (error) {
      throw error
    }
  }

  async delete({
    idCompany,
    deletedById,
    email
  }: {
    idCompany: string | ObjectId
    deletedById: ObjectId | string
    email: string
  }) {
    try {
      const company = await this.companiesRepo.delete({
        idCompany,
        deletedById,
        email
      })
      if (!company) {
        throw new NotFoundException('Công ty không tồn tại')
      }
      return {
        ...company,
        deleted: company.matchedCount
      }
    } catch (error) {
      throw error
    }
  }
}
