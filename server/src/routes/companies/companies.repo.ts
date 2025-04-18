import { Injectable } from '@nestjs/common'
import { MongoDBService } from 'src/shared/services/mongodb.service'
import { CreateCompanyBodyType, PaginationResType, PaginationType, UpdateCompanyBodyType } from './companies.model'
import { Company } from './companies.schema'
import { ObjectId, UpdateResult, WithId } from 'mongodb'
import aqp from 'api-query-params'

@Injectable()
export class CompaniesRepo {
  constructor(private readonly mongoDbService: MongoDBService) {}

  async find(pagination: PaginationType): Promise<PaginationResType> {
    const { current, pageSize, index, ...rest } = pagination
    const { filter, sort } = aqp(rest)
    const skip = (current - 1) * pageSize
    if (index !== undefined && index !== null) {
      const result = await this.mongoDbService
        .getCompanies()
        .find({ deletedAt: null, ...filter })
        .skip(Number(index) - 1)
        .sort(sort as any)
        .limit(1)
        .toArray()
      return {
        meta: {
          current: 1,
          total: result.length,
          pageSize: 1,
          pages: 1
        },
        result
      }
    }

    const [companies, total] = await Promise.all([
      this.mongoDbService
        .getCompanies()
        .find({
          deletedAt: null,
          ...filter
        })
        .skip(skip)
        .limit(pageSize)
        .sort(sort as any)
        .toArray(),
      this.mongoDbService.getCompanies().countDocuments({
        deletedAt: null,
        ...filter
      })
    ])
    return {
      meta: {
        current,
        total,
        pageSize: companies.length,
        pages: Math.ceil(total / pageSize)
      },
      result: companies
    }
  }

  async findById(idCompany: string | ObjectId): Promise<WithId<Company> | null> {
    return this.mongoDbService.getCompanies().findOne({
      _id: new ObjectId(idCompany),
      deletedAt: null
    })
  }

  async create({
    data,
    createdById,
    email
  }: {
    data: CreateCompanyBodyType
    createdById: string | ObjectId
    email: string
  }): Promise<WithId<Company> | null> {
    const companyId = await this.mongoDbService.getCompanies().insertOne(
      new Company({
        ...data,
        createdBy: {
          _id: new ObjectId(createdById),
          email
        }
      })
    )
    if (!companyId) {
      return null
    }
    const companyData = await this.mongoDbService.getCompanies().findOne({
      _id: companyId.insertedId,
      deletedAt: null
    })
    return companyData
  }

  async update({
    data,
    email,
    idCompany,
    updatedById
  }: {
    data: UpdateCompanyBodyType
    updatedById: string | ObjectId
    email: string
    idCompany: string | ObjectId
  }): Promise<UpdateResult<Company> | null> {
    return this.mongoDbService.getCompanies().updateOne(
      {
        _id: new ObjectId(idCompany),
        deletedAt: null
      },
      {
        $set: {
          ...data,
          updatedBy: {
            _id: new ObjectId(updatedById),
            email
          }
        },
        $currentDate: {
          updatedAt: true
        }
      }
    )
  }

  async delete({
    deletedById,
    idCompany,
    email
  }: {
    idCompany: string | ObjectId
    deletedById: string | ObjectId
    email: string
  }): Promise<UpdateResult<Company> | null> {
    return this.mongoDbService.getCompanies().updateOne(
      {
        _id: new ObjectId(idCompany),
        deletedAt: null
      },
      {
        $set: {
          deletedAt: new Date(),
          deletedBy: {
            _id: new ObjectId(deletedById),
            email
          }
        }
      }
    )
  }
}
