import { Injectable, NotFoundException } from '@nestjs/common'
import { ObjectId, UpdateResult, WithId } from 'mongodb'
import { MongoDBService } from 'src/shared/services/mongodb.service'
import { CreateResumeBodyType, PaginationType, UpdateResumeBodyType } from './resumes.model'
import { Resume } from './resumes.schema'
import aqp from 'api-query-params'

@Injectable()
export class ResumeRepo {
  constructor(private readonly mongoDBService: MongoDBService) {}

  async find(pagination: PaginationType): Promise<any> {
    const { current, pageSize, index, ...rest } = pagination
    const { filter, sort } = aqp(rest)
    const skip = (current - 1) * pageSize
    if (index !== undefined && index !== null) {
      const result = await this.mongoDBService
        .getResumes()
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
    const [jobs, total] = await Promise.all([
      // this.mongoDBService
      //   .getResumes()
      //   .find({
      //     deletedAt: null,
      //     ...filter
      //   })
      //   .skip(skip)
      //   .limit(pageSize)
      //   .sort(sort as any)
      //   .toArray(),

      this.mongoDBService
        .getResumes()
        .aggregate([
          {
            $match: {
              ...filter,
              deletedAt: null
            }
          },
          {
            $skip: skip
          },
          {
            $limit: pageSize
          },
          {
            $sort: sort || { createdAt: -1 }
          },
          {
            $addFields: {
              jobIdObject: { $toObjectId: '$jobId' },
              companyIdObject: { $toObjectId: '$companyId' }
            }
          },
          {
            $lookup: {
              from: 'companies',
              localField: 'companyIdObject',
              foreignField: '_id',
              as: 'companyDetails'
            }
          },
          {
            $unwind: '$companyDetails'
          },
          {
            $lookup: {
              from: 'jobs',
              localField: 'jobIdObject',
              foreignField: '_id',
              as: 'jobDetails'
            }
          },
          {
            $unwind: '$jobDetails'
          },
          {
            $addFields: {
              companyId: {
                _id: '$companyDetails._id',
                name: '$companyDetails.name',
                logo: '$companyDetails.logo'
              },
              jobId: {
                _id: '$jobDetails._id',
                name: '$jobDetails.name'
              }
            }
          },
          {
            $project: {
              jobDetails: 0,
              companyDetails: 0
            }
          }
        ])
        .toArray(),
      this.mongoDBService.getResumes().countDocuments({
        deletedAt: null,
        ...filter
      })
    ])
    // for (const job of jobs) {
    //   if (job.company) {
    //     const logo = await this.findByCompanyId({ companyId: job.company._id })
    //     job.company.logo = logo
    //   }
    // }
    return {
      meta: {
        current,
        total,
        pageSize: jobs.length,
        pages: Math.ceil(total / pageSize)
      },
      result: jobs
    }
  }

  async findByUserId(userId: ObjectId): Promise<any> {
    const resume = this.mongoDBService
      .getResumes()
      .aggregate([
        {
          $match: {
            userId,
            deletedAt: null
          }
        },
        {
          $addFields: {
            jobIdObject: { $toObjectId: '$jobId' },
            companyIdObject: { $toObjectId: '$companyId' }
          }
        },
        {
          $lookup: {
            from: 'companies',
            localField: 'companyIdObject',
            foreignField: '_id',
            as: 'companyDetails'
          }
        },
        {
          $unwind: '$companyDetails'
        },
        {
          $lookup: {
            from: 'jobs',
            localField: 'jobIdObject',
            foreignField: '_id',
            as: 'jobDetails'
          }
        },
        {
          $unwind: '$jobDetails'
        },
        // {
        //   $project: {
        //     _id: 1,
        //     url: 1,
        //     email: 1,
        //     status: 1,
        //     companyId: { _id: '$companyId._id', name: '$companyId.name', logo: '$companyId.logo' },
        //     jobId: { _id: '$jobId._id', name: '$jobId.name' }
        //   }
        // }
        {
          $addFields: {
            companyId: {
              _id: '$companyDetails._id',
              name: '$companyDetails.name',
              logo: '$companyDetails.logo'
            },
            jobId: {
              _id: '$jobDetails._id',
              name: '$jobDetails.name'
            }
          }
        }
        // {
        //   $replaceRoot: {
        //     newRoot: {
        //       $mergeObjects: [
        //         '$$ROOT',
        //         {
        //           userName: '$user.name',
        //           userEmail: '$user.email',
        //           jobTitle: '$job.name',
        //           companyName: '$company.name'
        //         }
        //       ]
        //     }
        //   }
        // }
      ])
      .toArray()
    // .find({
    //   userId,
    //   deletedAt: null
    // })
    // .toArray()
    return resume
  }

  async findById(resumeId: string | ObjectId): Promise<WithId<Resume> | null> {
    const resume = await this.mongoDBService.getResumes().findOne({
      _id: new ObjectId(resumeId),
      deletedAt: null
    })
    return resume
  }

  async create({
    data,
    email,
    userId
  }: {
    data: CreateResumeBodyType
    email: string
    userId: ObjectId
  }): Promise<WithId<Resume> | null> {
    const [company, job] = await Promise.all([
      this.mongoDBService.getCompanies().findOne({ _id: new ObjectId(data.companyId), deletedAt: null }),
      this.mongoDBService.getJobs().findOne({ _id: new ObjectId(data.jobId), deletedAt: null })
    ])
    if (!company) {
      throw new NotFoundException(`Company with id ${data.companyId.toString()} not found`)
    }
    if (!job) {
      throw new NotFoundException(`Job with id ${data.jobId.toString()} not found`)
    }
    const resumeId = await this.mongoDBService.getResumes().insertOne(
      new Resume({
        ...data,
        email,
        userId,
        createdBy: {
          _id: userId,
          email
        }
      })
    )
    if (resumeId) {
      const resume = await this.mongoDBService.getResumes().findOne({
        _id: resumeId.insertedId,
        deletedAt: null
      })
      return resume
    }
    return null
  }

  async update({
    data,
    updatedById,
    resumeId,
    email
  }: {
    email: string
    resumeId: string | ObjectId
    updatedById: string | ObjectId
    data: UpdateResumeBodyType
  }): Promise<UpdateResult<Resume>> {
    const resume = await this.mongoDBService.getResumes().findOne({
      _id: new ObjectId(resumeId),
      deletedAt: null
    })
    if (!resume) {
      throw new NotFoundException(`Resume with id ${resumeId.toString()} not found`)
    }
    const updateResume = await this.mongoDBService.getResumes().updateOne(
      {
        _id: new ObjectId(resumeId),
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
        },
        $push: {
          history: {
            status: data.status,
            updatedAt: new Date(),
            updatedBy: {
              _id: new ObjectId(updatedById),
              email
            }
          }
        }
      }
    )
    return updateResume
  }

  async delete({
    resumeId,
    email,
    deletedById
  }: {
    resumeId: string | ObjectId
    email: string
    deletedById: string | ObjectId
  }): Promise<UpdateResult<Resume>> {
    const resume = await this.mongoDBService.getResumes().findOne({
      _id: new ObjectId(resumeId),
      deletedAt: null
    })
    if (!resume) {
      throw new NotFoundException(`Resume with id ${resumeId.toString()} not found`)
    }
    const deleteResume = await this.mongoDBService.getResumes().updateOne(
      {
        _id: new ObjectId(resumeId),
        deletedAt: null
      },
      {
        $set: {
          deletedBy: {
            _id: new ObjectId(deletedById),
            email
          },
          deletedAt: new Date()
        }
      }
    )
    return deleteResume
  }
}
