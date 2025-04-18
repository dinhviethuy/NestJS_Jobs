import { Injectable, NotFoundException } from '@nestjs/common'
import { MongoDBService } from 'src/shared/services/mongodb.service'
import { CreateJobBodyType, PaginationResType, PaginationType, UpdateJobBodyType } from './jobs.model'
import { ObjectId, UpdateResult, WithId } from 'mongodb'
import { Job } from './jobs.schema'
import aqp from 'api-query-params'
import { FieldUserType } from 'src/shared/decorators/active-user.decorator'
import { RoleNameObject } from 'src/shared/constants/orther.constant'

@Injectable()
export class JobsRepo {
  constructor(private readonly mongoDBService: MongoDBService) {}

  private async findUserById(userId: string | ObjectId) {
    return await this.mongoDBService
      .getUsers()
      .aggregate([
        {
          $match: {
            _id: new ObjectId(userId),
            deletedAt: null
          }
        },
        {
          $addFields: {
            roleObject: {
              $toObjectId: '$role'
            }
          }
        },
        {
          $lookup: {
            from: 'roles',
            localField: 'roleObject',
            foreignField: '_id',
            as: 'role'
          }
        },
        {
          $unwind: '$role'
        },
        {
          $addFields: {
            roles: {
              name: '$role.name',
              _id: '$role._id'
            }
          }
        }
      ])
      .next()
  }

  async findByCompanyId({ companyId }: { companyId: string | ObjectId }): Promise<string> {
    const company = await this.mongoDBService.getCompanies().findOne({
      _id: new ObjectId(companyId),
      deletedAt: null
    })
    if (!company) {
      throw new NotFoundException(`Company with id ${companyId.toString()} not found`)
    }
    return company.logo
  }

  async find(pagination: PaginationType, user?: FieldUserType) {
    // const userDb = await this.findUserById(user._id)

    // if (!userDb) {
    //   throw new NotFoundException(`User with id ${user._id.toString()} not found`)
    // }
    const { current, pageSize, index, ...rest } = pagination
    const { filter, sort } = aqp(rest)
    const skip = (current - 1) * pageSize
    // if (index !== undefined && index !== null) {
    //   const result = await this.mongoDBService
    //     .getJobs()
    //     .find({ deletedAt: null, ...filter })
    //     .skip(Number(index) - 1)
    //     .sort(sort as any)
    //     .limit(1)
    //     .toArray()
    //   for (const job of result) {
    //     if (job.company) {
    //       const logo = await this.findByCompanyId({ companyId: job.company._id })
    //       job.company.logo = logo
    //     }
    //   }
    //   return {
    //     meta: {
    //       current: 1,
    //       total: result.length,
    //       pageSize: 1,
    //       pages: 1
    //     },
    //     result
    //   }
    // }
    const matchQuery: Record<string, any> = {
      deletedAt: null,
      ...filter
    }

    // if (userDb.roles.name !== RoleNameObject.ADMIN) {
    //   matchQuery['company._id'] = userDb.company?._id?.toString()
    //   matchQuery.company = { $ne: null }
    // }
    const [jobs, total] = await Promise.all([
      this.mongoDBService
        .getJobs()
        .aggregate([
          {
            $match: matchQuery
          },
          {
            $sort: sort || { createdAt: -1 }
          },
          {
            $skip: skip > 0 ? skip - 1 : 0
          }
        ])
        .toArray(),
      this.mongoDBService
        .getJobs()
        .aggregate([
          {
            $match: matchQuery
          },
          {
            $count: 'total'
          }
        ])
        .next()
    ])
    for (const job of jobs) {
      if (job.company) {
        const logo = await this.findByCompanyId({ companyId: job.company._id })
        job.company.logo = logo
      }
    }
    return {
      meta: {
        current,
        total: total?.total,
        pageSize: jobs.length,
        pages: Math.ceil(total?.total / pageSize)
      },
      result: jobs
    }
  }

  async findById({ jobId }: { jobId: string | ObjectId }): Promise<WithId<Job> | null> {
    const job = await this.mongoDBService.getJobs().findOne({
      _id: new ObjectId(jobId),
      deletedAt: null
    })
    if (!job) {
      throw new NotFoundException(`Job with id ${jobId.toString()} not found`)
    }
    if (job.company) {
      const logo = await this.findByCompanyId({ companyId: job.company._id })
      job.company.logo = logo
    }
    return job
  }

  async create({
    data,
    createdById,
    email
  }: {
    data: CreateJobBodyType
    createdById: string | ObjectId
    email: string
  }): Promise<WithId<Job> | null> {
    if (data.company) {
      const company = await this.mongoDBService.getCompanies().findOne({
        _id: new ObjectId(data.company._id),
        deletedAt: null
      })
      if (!company) {
        throw new NotFoundException(`Company with id ${data.company._id.toString()} not found`)
      }
    }
    const jobId = await this.mongoDBService.getJobs().insertOne(
      new Job({
        ...data,
        createdBy: {
          _id: new ObjectId(createdById),
          email
        }
      })
    )
    if (jobId) {
      return this.mongoDBService.getJobs().findOne({
        _id: jobId.insertedId,
        deletedAt: null
      })
    }
    return null
  }

  async update({
    data,
    jobId,
    updatedById,
    email
  }: {
    data: UpdateJobBodyType
    updatedById: string | ObjectId
    jobId: string | ObjectId
    email: string
  }): Promise<UpdateResult<Job>> {
    if (data.company) {
      const company = await this.mongoDBService.getCompanies().findOne({
        _id: new ObjectId(data.company._id),
        deletedAt: null
      })
      if (!company) {
        throw new NotFoundException(`Company with id ${data.company._id.toString()} not found`)
      }
    }
    const job = await this.mongoDBService.getJobs().findOne({
      _id: new ObjectId(jobId),
      deletedAt: null
    })
    if (!job) {
      throw new NotFoundException(`Job with id ${jobId.toString()} not found`)
    }
    return this.mongoDBService.getJobs().updateOne(
      {
        _id: new ObjectId(jobId),
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
    email,
    jobId
  }: {
    jobId: string | ObjectId
    deletedById: string | ObjectId
    email: string
  }) {
    const job = await this.mongoDBService.getJobs().findOne({
      _id: new ObjectId(jobId),
      deletedAt: null
    })
    if (!job) {
      throw new NotFoundException(`Job with id ${jobId.toString()} not found`)
    }
    return this.mongoDBService.getJobs().updateOne(
      {
        _id: new ObjectId(jobId),
        deletedAt: null
      },
      {
        $set: {
          deletedBy: {
            _id: new ObjectId(deletedById),
            email
          }
        },
        $currentDate: {
          deletedAt: true
        }
      }
    )
  }
}
